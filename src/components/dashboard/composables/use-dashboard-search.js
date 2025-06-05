import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import fuzzySearch from 'fuzzy-search'

export function useDashboardSearch() {
  const searchBoxTarget = ref(null)
  const showSearchBox = ref(false)
  const searchBoxPlacement = ref('bottom-center')
  const teleportThreshold = ref(500)
  const searchResults = ref([])
  
  // Component search configuration
  const componentSearch = new Map([
    [
      'youtube-music',
      {
        name: 'Youtube Music',
        description: 'Youtube Music',
        icon: 'youtube_activity',
        label: 'Youtube Music',
        display: {
          flat: true,
          transparent: false,
          border: true,
        },
      },
    ],
    [
      'note',
      {
        name: 'Note',
        description: 'Note',
        icon: 'note',
        label: 'Note',
        tags: ['note', 'note-editor'],
      },
    ],
    [
      'text',
      {
        name: 'Text',
        description: 'Text',
        icon: 'description',
        tags: ['text', 'text-editor'],
        display: {
          flat: true,
          transparent: true,
          border: false,
        },
      },
    ],
    [
      'todo-list-daily',
      {
        name: 'Todo List: Daily',
        description: 'Todo List: Daily',
        tags: ['todo', 'list', 'daily'],
        icon: 'list_alt_check',
        display: {
          flat: true,
          transparent: true,
          border: false,
        },
      },
    ],
    [
      'event-calendar',
      {
        name: 'Event Calendar',
        description: 'Event Calendar',
        tags: ['event', 'calendar'],
        icon: 'calendar_month',
        display: {
          flat: true,
          transparent: false,
          border: false,
        },
      },
    ],
  ])

  const placementOptions = [
    'bottom-center',
    'bottom-left',
    'bottom-right',
    'top-center',
    'right-center',
    'left-center',
  ]

  // Initialize search results
  const initializeSearchResults = () => {
    searchResults.value = [
      ...componentSearch.entries().map(([key, item]) => ({ ...item, id: key })),
    ]
  }

  // Search functionality
  const onSearch = (searchTerm) => {
    const searcher = new fuzzySearch(
      Array.from(componentSearch.entries()).map(([key, item]) => ({
        ...item,
        id: key,
      })),
      ['name', 'description', 'tags'],
      { caseSensitive: false }
    )
    
    const results = searcher.search(searchTerm)
    searchResults.value.splice(0, searchResults.value.length, ...results)
  }

  // Search box positioning
  const getElementBounds = (element) => {
    if (!element) return null
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }
  }

  const getDashboardItemElement = (itemId) => {
    return document.getElementById(itemId)
  }

  const updateSearchBoxPosition = (selectedItems) => {
    if (showSearchBox.value && selectedItems.length === 1) {
      const itemId = selectedItems[0]
      const itemElement = getDashboardItemElement(itemId)
      if (itemElement) {
        searchBoxTarget.value = getElementBounds(itemElement)
      }
    }
  }

  // Real-time position updates
  let updateSearchBoxFrame = null
  const updateSearchBoxPositionRealtime = (id, selectedItems) => {
    if (selectedItems.includes(id) && showSearchBox.value) {
      if (updateSearchBoxFrame) {
        cancelAnimationFrame(updateSearchBoxFrame)
      }

      updateSearchBoxFrame = requestAnimationFrame(() => {
        const itemElement = getDashboardItemElement(id)
        if (itemElement) {
          searchBoxTarget.value = getElementBounds(itemElement)
        }
        updateSearchBoxFrame = null
      })
    }
  }

  // Search box control
  const showSearchBoxForItem = (itemId) => {
    const itemElement = getDashboardItemElement(itemId)
    if (itemElement) {
      searchBoxTarget.value = getElementBounds(itemElement)
      showSearchBox.value = true
    }
  }

  const hideSearchBox = () => {
    showSearchBox.value = false
  }

  // Placement cycling (for testing/debugging)
  const cyclePlacement = () => {
    const currentIndex = placementOptions.indexOf(searchBoxPlacement.value)
    const nextIndex = (currentIndex + 1) % placementOptions.length
    searchBoxPlacement.value = placementOptions[nextIndex]
    console.log('Search box placement:', searchBoxPlacement.value)
  }

  // Event handlers
  const handleSearchBoxClose = () => {
    hideSearchBox()
  }

  const handleSearchBoxEnter = (result, items, selectedItems, saveCallback) => {
    if (result && selectedItems.length === 1) {
      const itemId = selectedItems[0]
      const item = items.get(itemId)
      if (item) {
        item.widget = result.id
        if (result.display) {
          Object.assign(item, result.display)
        }
        saveCallback(item)
      }
    }
  }

  const handleSelectSearchResult = (result, items, selectedItems, saveCallback) => {
    if (selectedItems.length === 1) {
      const itemId = selectedItems[0]
      const item = items.get(itemId)
      if (item) {
        item.widget = result.id
        if (result.display) {
          Object.assign(item, result.display)
        }
        saveCallback(item)
      }
    }
    hideSearchBox()
  }

  // Setup and cleanup
  const setupSearchBox = () => {
    window.addEventListener('resize', () => updateSearchBoxPosition())
    initializeSearchResults()
  }

  const cleanupSearchBox = () => {
    window.removeEventListener('resize', () => updateSearchBoxPosition())
    if (updateSearchBoxFrame) {
      cancelAnimationFrame(updateSearchBoxFrame)
    }
  }

  onMounted(() => {
    setupSearchBox()
  })

  onBeforeUnmount(() => {
    cleanupSearchBox()
  })

  return {
    // State
    searchBoxTarget,
    showSearchBox,
    searchBoxPlacement,
    teleportThreshold,
    searchResults,
    componentSearch,
    placementOptions,

    // Search functionality
    onSearch,
    initializeSearchResults,

    // Positioning
    getElementBounds,
    getDashboardItemElement,
    updateSearchBoxPosition,
    updateSearchBoxPositionRealtime,

    // Control
    showSearchBoxForItem,
    hideSearchBox,
    cyclePlacement,

    // Event handlers
    handleSearchBoxClose,
    handleSearchBoxEnter,
    handleSelectSearchResult,

    // Setup/cleanup
    setupSearchBox,
    cleanupSearchBox,
  }
} 