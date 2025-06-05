<template>
  <div class="dashboard-wrapper">
    <LmContainer fluid class="dashboard-header">
      <Row>
        <div id="anchor_1">
          <h1>Dashboard</h1>
        </div>
      </Row>
    </LmContainer>
    
    <div
      class="dashboard-container"
      ref="dashboardContainer"
      @click="onDashboardClick"
      @pointerdown="handleDashboardPointerDownWrapper"
      @pointermove="handleDashboardPointerMoveWrapper"
      @pointerup="handleDashboardPointerUpWrapper"
      @pointercancel="handleDashboardPointerUpWrapper"
      @mousemove="handleMouseMove"
    >
      <DashboardItem
        v-for="[key, item] in items"
        :key="key"
        :id="item.id"
        :title="item.title"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        :selected="selectedItems"
        :dragGroup="dragGroup"
        :widget="item.widget"
        @update:position="updateItemPosition(item.id, $event)"
        @update:dragEnd="onDragEnd(item.id, $event)"
        @update:resize="onResize(item.id, $event)"
        @update:resize-end="onResizeEnd(item.id)"
        @update:select="onItemClick(item.id, $event)"
      >
        <template v-if="item.widget && componentMap[item.widget]" #default="{ lockContent }">
          <component :is="componentMap[item.widget]" :lockContent="lockContent" />
        </template>
      </DashboardItem>

      <DashboardSelectBox
        :selectedItems="selectedItems"
        :selectionBox="selectionBox"
        :dragStart="isDragging"
      />
      
      <DashboardSelectBox
        :selectedItems="selectedItems"
        :selectionBox="selectionDragBox"
        :dragStart="isDragging"
      />

      <SearchBox
        :results="searchResults"
        :targetElement="searchBoxTarget"
        :show="showSearchBox"
        :placement="searchBoxPlacement"
        :teleportThreshold="teleportThreshold"
        @search="onSearch"
        @close="handleSearchBoxClose"
        @select="onSelectSearchResult"
        @enter="handleSearchBoxEnter"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import LmContainer from '../container/lm-container.vue'
import Row from '../container/row.vue'
import DashboardItem from './dashboard-item.vue'
import DashboardSelectBox from './dashboard-select-box.vue'
import SearchBox from '../search-box/search-box.vue'

// Import individual composables (selective approach)
import { 
  useDashboardItems,
  useDashboardSelection,
  useDashboardDragDrop,
  useDashboardSearch,
  useDashboardKeyboard,
  useDashboardResize
} from './composables'

// Widget imports for component map
import YoutubeMusic from '/src/widgets/youtube-music.vue'
import Note from '/src/widgets/note.vue'
import Text from '/src/widgets/text.vue'
import TodoListDaily from '/src/widgets/todo-list-daily.vue'
import EventCalendar from '/src/widgets/event-calendar.vue'

// Container reference
const dashboardContainer = ref(null)

// Initialize all composables individually
const itemsComposable = useDashboardItems()
const selection = useDashboardSelection()
const dragDrop = useDashboardDragDrop()
const search = useDashboardSearch()
const keyboard = useDashboardKeyboard()
const resize = useDashboardResize()

// Extract individual functionality from composables
const {
  items,
  snapToGrid,
  applyBoundaryConstraints,
  saveItem,
  saveItems,
  deleteItem,
  deleteItems,
  createItem,
  updateItemPosition: updatePosition,
  updateItemSize,
  copyItems,
  pasteItems,
  dbHistory
} = itemsComposable

const {
  selectedItems,
  dragGroup,
  selectionBox,
  selectionDragBox,
  hasSelection,
  hasSingleSelection,
  hasMultipleSelection,
  selectItem,
  deselectItem,
  toggleItemSelection,
  clearSelection,
  selectOnly,
  selectMultiple,
  handleItemClick: handleSelection,
  updateSelectionBox,
  resetSelectionDragBox,
  updateSelectionDragBox,
  getItemsInSelectionBox,
  addToDragGroup,
  removeFromDragGroup,
  clearDragGroup
} = selection

const {
  isDragging,
  isMovingItems,
  pointerDown,
  dragStartPos,
  dragCurrentPos,
  mousePosition,
  handleMouseMove,
  handleDashboardPointerDown,
  handleDashboardPointerMove,
  handleDashboardPointerUp,
  handleItemDragStart,
  handleItemDragMove,
  handleItemDragEnd
} = dragDrop

const {
  searchBoxTarget,
  showSearchBox,
  searchBoxPlacement,
  teleportThreshold,
  searchResults,
  componentSearch,
  placementOptions,
  onSearch,
  initializeSearchResults,
  getElementBounds,
  getDashboardItemElement,
  updateSearchBoxPosition,
  updateSearchBoxPositionRealtime,
  showSearchBoxForItem,
  hideSearchBox,
  cyclePlacement,
  handleSearchBoxClose,
  handleSearchBoxEnter: searchHandleEnter,
  handleSelectSearchResult,
  setupSearchBox,
  cleanupSearchBox
} = search

const {
  spacePressed,
  hotKeys,
  createCommands,
  handleKeyDown,
  handleKeyUp,
  setupKeyboardListeners
} = keyboard

const {
  handleItemResize,
  handleItemResizeEnd
} = resize

// Component map for dynamic rendering
const componentMap = {
  'youtube-music': YoutubeMusic,
  note: Note,
  text: Text,
  'todo-list-daily': TodoListDaily,
  'event-calendar': EventCalendar,
}

// Track click count for double-click detection
const timesClicked = ref(0)

// Watch for selection changes to update selection box
watch(
  () => selectedItems.value,
  (newSelectedItems) => {
    // Update selected items tracking in items composable
    const filteredItems = newSelectedItems.filter(id => items.has(id))
    selectedItems.value = filteredItems

    // Update selection box
    const selectedItemsData = filteredItems.map(id => items.get(id))
    updateSelectionBox(selectedItemsData)
  },
  { immediate: true }
)

// Create commands with all dependencies
const commands = createCommands({
  dbHistory,
  items,
  selectedItems,
  dashboardContainer,
  mousePosition,
  selectionDragBox,
  itemsComposable,
  search,
  selection,
})

// Dashboard event handlers
const onDashboardClick = (event) => {
  if (event.target === dashboardContainer.value) {
    clearSelection()
  }
}

const handleDashboardPointerDownWrapper = (event) => {
  handleDashboardPointerDown(event, dashboardContainer.value, selection)
}

const handleDashboardPointerMoveWrapper = (event) => {
  handleDashboardPointerMove(event, dashboardContainer.value, selection, items)
}

const handleDashboardPointerUpWrapper = (event) => {
  handleDashboardPointerUp(event, dashboardContainer.value, selection)
}

// Item event handlers
const updateItemPosition = (id, position) => {
  const item = items.get(id)
  if (!item) return

  if (selectedItems.value.length === 1) {
    // Single item movement
    updatePosition(id, position, dashboardContainer.value)
    
    // Update search box position in real-time
    if (selectedItems.value.includes(id) && showSearchBox.value) {
      updateSearchBoxPositionRealtime(id, selectedItems.value)
    }
  } else if (selectedItems.value.length > 1) {
    // Multiple items movement
    handleItemDragMove(id, position, items, selection, (itemId, pos) => {
      updatePosition(itemId, pos, dashboardContainer.value)
    })

    // Hide search box during multi-item drag
    if (showSearchBox.value) {
      hideSearchBox()
    }
  }
}

const onDragEnd = (id) => {
  handleItemDragEnd(
    id,
    items,
    selection,
    (item) => {
      if (Array.isArray(item)) {
        saveItems(item)
      } else {
        saveItem(item)
      }
    },
    snapToGrid,
    applyBoundaryConstraints,
    dashboardContainer.value
  )

  // Update search box position
  if (selectedItems.value.includes(id)) {
    nextTick(() => updateSearchBoxPosition(selectedItems.value))
  }
}

const onResize = (id, resizeData) => {
  handleItemResize(
    id,
    resizeData,
    items,
    snapToGrid,
    applyBoundaryConstraints,
    dashboardContainer.value,
    updateSearchBoxPositionRealtime,
    selectedItems.value
  )
}

const onResizeEnd = (id) => {
  handleItemResizeEnd(
    id,
    items,
    snapToGrid,
    applyBoundaryConstraints,
    dashboardContainer.value,
    saveItem,
    updateSearchBoxPosition,
    selectedItems.value
  )
}

const onItemClick = (id, event) => {
  if (isMovingItems.value) {
    isMovingItems.value = false
    return
  }

  timesClicked.value++

  // Handle selection logic
  if (event.shiftKey || event.ctrlKey) {
    toggleItemSelection(id)
  } else {
    if (selectedItems.value.length > 1 || !selectedItems.value.includes(id)) {
      selectOnly(id)
    }
  }
}

// Search event handlers
const handleSearchBoxEnter = (result) => {
  searchHandleEnter(result, items, selectedItems.value, saveItem)
}

const onSelectSearchResult = (result) => {
  handleSelectSearchResult(result, items, selectedItems.value, saveItem)
}

// Setup and cleanup
let keyboardCleanup = null

onMounted(() => {
  // Setup keyboard listeners
  keyboardCleanup = setupKeyboardListeners(commands, search)
  
  // Setup mouse move tracking
  window.addEventListener('mousemove', handleMouseMove)
})

onBeforeUnmount(() => {
  // Cleanup
  if (keyboardCleanup) {
    keyboardCleanup()
  }
  window.removeEventListener('mousemove', handleMouseMove)
  
  // Cleanup search box
  cleanupSearchBox()
  
  // Cleanup database subscription
  if (itemsComposable.unsubscribe) {
    itemsComposable.unsubscribe()
  }
})

// Development helper
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.dashboardDebug = {
    updateSearchBoxPosition: () => updateSearchBoxPosition(selectedItems.value),
    updateSearchBoxPositionRealtime,
    cyclePlacement,
    getElementBounds,
    getDashboardItemElement,
    get teleportThreshold() {
      return teleportThreshold.value
    },
    set teleportThreshold(value) {
      teleportThreshold.value = value
    },
    get searchBoxPlacement() {
      return searchBoxPlacement.value
    },
    set searchBoxPlacement(value) {
      searchBoxPlacement.value = value
    },
    // Individual composables for debugging
    itemsComposable,
    selection,
    dragDrop,
    search,
    keyboard,
    resize,
    commands,
    hotKeys
  }
}
</script>

<style scoped>
.dashboard-container {
  position: relative;
}

.dashboard-wrapper {
  height: 100%;
  display: flex;
  flex-flow: column;
}

.dashboard-container {
  flex: 1;
}
</style> 