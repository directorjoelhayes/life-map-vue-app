import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useDashboardItems } from './use-dashboard-items.js'
import { useDashboardSelection } from './use-dashboard-selection.js'
import { useDashboardDragDrop } from './use-dashboard-drag-drop.js'
import { useDashboardSearch } from './use-dashboard-search.js'
import { useDashboardKeyboard } from './use-dashboard-keyboard.js'
import { useDashboardResize } from './use-dashboard-resize.js'

// Widget imports
import YoutubeMusic from '/src/widgets/youtube-music.vue'
import Note from '/src/widgets/note.vue'
import Text from '/src/widgets/text.vue'
import TodoListDaily from '/src/widgets/todo-list-daily.vue'
import EventCalendar from '/src/widgets/event-calendar.vue'

export function useDashboard() {
  // Container reference
  const dashboardContainer = ref(null)
  
  // Initialize all composables
  const itemsComposable = useDashboardItems()
  const selection = useDashboardSelection()
  const dragDrop = useDashboardDragDrop()
  const search = useDashboardSearch()
  const keyboard = useDashboardKeyboard()
  const resize = useDashboardResize()

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
    () => selection.selectedItems.value,
    (newSelectedItems) => {
      // Update selected items tracking in items composable
      const filteredItems = newSelectedItems.filter(id => itemsComposable.items.has(id))
      selection.selectedItems.value = filteredItems

      // Update selection box
      const selectedItemsData = filteredItems.map(id => itemsComposable.items.get(id))
      selection.updateSelectionBox(selectedItemsData)
    },
    { immediate: true }
  )

  // Create commands with all dependencies
  const commands = keyboard.createCommands({
    dbHistory: itemsComposable.dbHistory,
    items: itemsComposable.items,
    selectedItems: selection.selectedItems,
    dashboardContainer,
    mousePosition: dragDrop.mousePosition,
    selectionDragBox: selection.selectionDragBox,
    itemsComposable,
    search,
    selection,
  })

  // Dashboard event handlers
  const onDashboardClick = (event) => {
    if (event.target === dashboardContainer.value) {
      selection.clearSelection()
    }
  }

  const handleDashboardPointerDown = (event) => {
    dragDrop.handleDashboardPointerDown(event, dashboardContainer.value, selection)
  }

  const handleDashboardPointerMove = (event) => {
    dragDrop.handleDashboardPointerMove(event, dashboardContainer.value, selection, itemsComposable.items)
  }

  const handleDashboardPointerUp = (event) => {
    dragDrop.handleDashboardPointerUp(event, dashboardContainer.value, selection)
  }

  // Item event handlers
  const updateItemPosition = (id, position) => {
    const item = itemsComposable.items.get(id)
    if (!item) return

    if (selection.selectedItems.value.length === 1) {
      // Single item movement
      itemsComposable.updateItemPosition(id, position, dashboardContainer.value)
      
      // Update search box position in real-time
      if (selection.selectedItems.value.includes(id) && search.showSearchBox.value) {
        search.updateSearchBoxPositionRealtime(id, selection.selectedItems.value)
      }
    } else if (selection.selectedItems.value.length > 1) {
      // Multiple items movement
      dragDrop.handleItemDragMove(id, position, itemsComposable.items, selection, (itemId, pos) => {
        itemsComposable.updateItemPosition(itemId, pos, dashboardContainer.value)
      })

      // Hide search box during multi-item drag
      if (search.showSearchBox.value) {
        search.hideSearchBox()
      }
    }
  }

  const onDragEnd = (id) => {
    dragDrop.handleItemDragEnd(
      id,
      itemsComposable.items,
      selection,
      (item) => {
        if (Array.isArray(item)) {
          itemsComposable.saveItems(item)
        } else {
          itemsComposable.saveItem(item)
        }
      },
      itemsComposable.snapToGrid,
      itemsComposable.applyBoundaryConstraints,
      dashboardContainer.value
    )

    // Update search box position
    if (selection.selectedItems.value.includes(id)) {
      nextTick(() => search.updateSearchBoxPosition(selection.selectedItems.value))
    }
  }

  const onResize = (id, resizeData) => {
    resize.handleItemResize(
      id,
      resizeData,
      itemsComposable.items,
      itemsComposable.snapToGrid,
      itemsComposable.applyBoundaryConstraints,
      dashboardContainer.value,
      search.updateSearchBoxPositionRealtime,
      selection.selectedItems.value
    )
  }

  const onResizeEnd = (id) => {
    resize.handleItemResizeEnd(
      id,
      itemsComposable.items,
      itemsComposable.snapToGrid,
      itemsComposable.applyBoundaryConstraints,
      dashboardContainer.value,
      itemsComposable.saveItem,
      search.updateSearchBoxPosition,
      selection.selectedItems.value
    )
  }

  const onItemClick = (id, event) => {
    if (dragDrop.isMovingItems.value) {
      dragDrop.isMovingItems.value = false
      return
    }

    timesClicked.value++

    // Handle selection logic
    if (event.shiftKey || event.ctrlKey) {
      selection.toggleItemSelection(id)
    } else {
      if (selection.selectedItems.value.length > 1 || !selection.selectedItems.value.includes(id)) {
        selection.selectOnly(id)
      }
    }
  }

  // Search event handlers
  const handleSearchBoxEnter = (result) => {
    search.handleSearchBoxEnter(result, itemsComposable.items, selection.selectedItems.value, itemsComposable.saveItem)
  }

  const onSelectSearchResult = (result) => {
    search.handleSelectSearchResult(result, itemsComposable.items, selection.selectedItems.value, itemsComposable.saveItem)
  }

  // Setup and cleanup
  let keyboardCleanup = null

  onMounted(() => {
    // Setup keyboard listeners
    keyboardCleanup = keyboard.setupKeyboardListeners(commands, search)
    
    // Setup mouse move tracking
    window.addEventListener('mousemove', dragDrop.handleMouseMove)
  })

  onBeforeUnmount(() => {
    // Cleanup
    if (keyboardCleanup) {
      keyboardCleanup()
    }
    window.removeEventListener('mousemove', dragDrop.handleMouseMove)
    
    // Cleanup search box
    search.cleanupSearchBox()
    
    // Cleanup database subscription
    if (itemsComposable.unsubscribe) {
      itemsComposable.unsubscribe()
    }
  })

  // Development helper
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.dashboardDebug = {
      updateSearchBoxPosition: () => search.updateSearchBoxPosition(selection.selectedItems.value),
      updateSearchBoxPositionRealtime: search.updateSearchBoxPositionRealtime,
      cyclePlacement: search.cyclePlacement,
      getElementBounds: search.getElementBounds,
      getDashboardItemElement: search.getDashboardItemElement,
      get teleportThreshold() {
        return search.teleportThreshold.value
      },
      set teleportThreshold(value) {
        search.teleportThreshold.value = value
      },
      get searchBoxPlacement() {
        return search.searchBoxPlacement.value
      },
      set searchBoxPlacement(value) {
        search.searchBoxPlacement.value = value
      },
    }
  }

  return {
    // Refs
    dashboardContainer,
    
    // Data
    items: itemsComposable.items,
    selectedItems: selection.selectedItems,
    dragGroup: selection.dragGroup,
    selectionBox: selection.selectionBox,
    selectionDragBox: selection.selectionDragBox,
    isDragging: dragDrop.isDragging,
    
    // Search
    searchBoxTarget: search.searchBoxTarget,
    showSearchBox: search.showSearchBox,
    searchBoxPlacement: search.searchBoxPlacement,
    teleportThreshold: search.teleportThreshold,
    searchResults: search.searchResults,
    
    // Component map
    componentMap,
    
    // Event handlers
    onDashboardClick,
    handleDashboardPointerDown,
    handleDashboardPointerMove,
    handleDashboardPointerUp,
    updateItemPosition,
    onDragEnd,
    onResize,
    onResizeEnd,
    onItemClick,
    
    // Search handlers
    onSearch: search.onSearch,
    handleSearchBoxClose: search.handleSearchBoxClose,
    handleSearchBoxEnter,
    onSelectSearchResult,
    
    // Mouse position
    handleMouseMove: dragDrop.handleMouseMove,
    
    // Commands (for external access)
    commands,
    
    // Keyboard info
    hotKeys: keyboard.hotKeys,
  }
} 