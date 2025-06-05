import { reactive, ref, onBeforeMount } from 'vue'
import { ulid } from 'ulid'
import makeDataStore from '../../../stores/make-data-store'
import composeDataStore from '../../../stores/compose-data-store'

export function useDashboardItems() {
  const items = reactive(new Map())
  
  // Database setup
  const useDbHistory = makeDataStore('dbHistory')
  const dbHistory = useDbHistory()

  // Helper functions for snapping and constraints
  const snapToGrid = (value, gridSize = 25) => {
    return Math.round(value / gridSize) * gridSize
  }

  const applyBoundaryConstraints = (item, containerElement) => {
    if (!containerElement) return

    const containerWidth = containerElement.clientWidth
    const containerHeight = containerElement.clientHeight

    // Check boundaries
    if (item.x < 0) item.x = 0
    if (item.y < 0) item.y = 0
    if (item.x + item.width > containerWidth) {
      item.x = Math.max(0, containerWidth - item.width)
    }
    if (item.y + item.height > containerHeight) {
      item.y = Math.max(0, containerHeight - item.height)
    }
  }

  // CRUD operations
  const saveItem = async (item) => {
    dbHistory.put(item.id, { ...item })
  }

  const saveItems = async (items) => {
    dbHistory.multiPut(items, 'saveItems')
  }

  const deleteItem = (id) => {
    dbHistory.del(id)
  }

  const deleteItems = (ids) => {
    dbHistory.multiDel(ids, 'Delete items')
  }

  const createItem = (options = {}) => {
    const id = ulid()
    const defaultItem = {
      id,
      title: 'Item 1',
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      widget: '',
      ...options
    }

    // Snap to grid
    defaultItem.x = snapToGrid(defaultItem.x)
    defaultItem.y = snapToGrid(defaultItem.y)
    defaultItem.width = snapToGrid(defaultItem.width)
    defaultItem.height = snapToGrid(defaultItem.height)

    dbHistory.put(id, defaultItem)
    return id
  }

  const updateItemPosition = (id, position, containerElement) => {
    const item = items.get(id)
    if (!item) return

    item.x = position.x
    item.y = position.y
    
    // Apply constraints and save
    applyBoundaryConstraints(item, containerElement)
    return item
  }

  const updateItemSize = (id, size, containerElement) => {
    const item = items.get(id)
    if (!item) return

    item.width = Math.max(100, size.width)
    item.height = Math.max(100, size.height)
    
    // Apply constraints and save
    applyBoundaryConstraints(item, containerElement)
    return item
  }

  const copyItems = (itemIds) => {
    const itemsToCopy = itemIds.map(id => {
      const item = items.get(id)
      return item ? { ...item } : null
    }).filter(Boolean)
    
    localStorage.setItem('dashboardCopiedItems', JSON.stringify(itemsToCopy))
    return itemsToCopy
  }

  const pasteItems = () => {
    const copiedItemsJson = localStorage.getItem('dashboardCopiedItems')
    if (!copiedItemsJson) return []

    const copiedItems = JSON.parse(copiedItemsJson)
    const offsetX = 50
    const offsetY = 50

    const newItems = copiedItems.map(item => {
      const newId = ulid()
      const newItem = {
        ...item,
        id: newId,
        x: item.x + offsetX,
        y: item.y + offsetY,
      }
      return [newId, newItem]
    })

    dbHistory.multiPut(newItems, 'Paste items')
    return newItems.map(([id]) => id)
  }

  // Database operations
  const loadItems = async () => {
    try {
      await dbHistory.loadDb()
      const savedItems = dbHistory.getAll
      items.clear()
      savedItems.forEach(item => {
        items.set(item.id, { ...item })
      })
    } catch (error) {
      console.error('Error loading items', error)
    }
  }

  // Setup database composition
  const unsubscribe = composeDataStore({
    store: dbHistory,
    data: items,
    runAfter: async ({ data, name, deletedItems }) => {
      dbHistory.saveDb()
    },
  })

  // Load items on mount
  onBeforeMount(loadItems)

  return {
    items,
    snapToGrid,
    applyBoundaryConstraints,
    saveItem,
    saveItems,
    deleteItem,
    deleteItems,
    createItem,
    updateItemPosition,
    updateItemSize,
    copyItems,
    pasteItems,
    loadItems,
    unsubscribe,
    dbHistory
  }
} 