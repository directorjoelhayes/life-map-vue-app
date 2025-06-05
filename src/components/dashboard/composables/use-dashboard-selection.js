import { ref, reactive, computed } from 'vue'

export function useDashboardSelection() {
  const selectedItems = ref([])
  const dragGroup = ref([])
  
  const selectionBox = ref({
    id: 'selection-box',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  const selectionDragBoxDefaults = {
    id: 'selection-drag-box',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  const selectionDragBox = ref({
    ...selectionDragBoxDefaults,
  })

  // Computed properties
  const hasSelection = computed(() => selectedItems.value.length > 0)
  const hasSingleSelection = computed(() => selectedItems.value.length === 1)
  const hasMultipleSelection = computed(() => selectedItems.value.length > 1)

  // Selection methods
  const selectItem = (id) => {
    if (!selectedItems.value.includes(id)) {
      selectedItems.value.push(id)
    }
  }

  const deselectItem = (id) => {
    const index = selectedItems.value.indexOf(id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  }

  const toggleItemSelection = (id) => {
    if (selectedItems.value.includes(id)) {
      deselectItem(id)
    } else {
      selectItem(id)
    }
  }

  const clearSelection = () => {
    selectedItems.value = []
    dragGroup.value = []
  }

  const selectOnly = (id) => {
    selectedItems.value = [id]
    dragGroup.value = []
  }

  const selectMultiple = (ids) => {
    selectedItems.value = [...ids]
    dragGroup.value = []
  }

  // Handle item click with modifiers
  const handleItemClick = (id, { shiftKey = false, ctrlKey = false } = {}) => {
    if (shiftKey || ctrlKey) {
      // Add to selection
      toggleItemSelection(id)
    } else {
      // Replace selection
      if (selectedItems.value.length > 1 || !selectedItems.value.includes(id)) {
        selectOnly(id)
      }
    }
  }

  // Selection box methods
  const updateSelectionBox = (items) => {
    if (!items || items.length === 0) {
      selectionBox.value = {
        id: 'selection-box',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
      return
    }

    if (items.length === 1) {
      const item = items[0]
      selectionBox.value = {
        id: 'selection-box',
        x: item.x - 5,
        y: item.y - 5,
        width: item.width + 10,
        height: item.height + 10,
      }
      return
    }

    // Multiple items - calculate bounding box
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    items.forEach(item => {
      minX = Math.min(minX, item.x)
      minY = Math.min(minY, item.y)
      maxX = Math.max(maxX, item.x + item.width)
      maxY = Math.max(maxY, item.y + item.height)
    })

    selectionBox.value = {
      id: 'selection-box',
      x: minX - 5,
      y: minY - 5,
      width: maxX - minX + 10,
      height: maxY - minY + 10,
    }
  }

  const resetSelectionDragBox = () => {
    selectionDragBox.value = { ...selectionDragBoxDefaults }
  }

  const updateSelectionDragBox = (startPos, currentPos) => {
    const startX = startPos.x
    const startY = startPos.y
    const currentX = currentPos.x
    const currentY = currentPos.y

    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    selectionDragBox.value = {
      id: 'selection-drag-box',
      x,
      y,
      width,
      height,
    }
  }

  // Check if items intersect with selection box
  const getItemsInSelectionBox = (items, boxBounds) => {
    const selectedIds = []
    
    items.forEach((item, id) => {
      const itemRight = item.x + item.width
      const itemBottom = item.y + item.height
      const boxRight = boxBounds.x + boxBounds.width
      const boxBottom = boxBounds.y + boxBounds.height

      // Check if item intersects with selection box
      const intersects = !(
        item.x > boxRight ||
        itemRight < boxBounds.x ||
        item.y > boxBottom ||
        itemBottom < boxBounds.y
      )

      if (intersects) {
        selectedIds.push(id)
      }
    })

    return selectedIds
  }

  // Drag group management
  const addToDragGroup = (id) => {
    if (!dragGroup.value.includes(id)) {
      dragGroup.value.push(id)
    }
  }

  const removeFromDragGroup = (id) => {
    const index = dragGroup.value.indexOf(id)
    if (index > -1) {
      dragGroup.value.splice(index, 1)
    }
  }

  const clearDragGroup = () => {
    dragGroup.value = []
  }

  return {
    // State
    selectedItems,
    dragGroup,
    selectionBox,
    selectionDragBox,
    
    // Computed
    hasSelection,
    hasSingleSelection,
    hasMultipleSelection,
    
    // Methods
    selectItem,
    deselectItem,
    toggleItemSelection,
    clearSelection,
    selectOnly,
    selectMultiple,
    handleItemClick,
    
    // Selection box
    updateSelectionBox,
    resetSelectionDragBox,
    updateSelectionDragBox,
    getItemsInSelectionBox,
    
    // Drag group
    addToDragGroup,
    removeFromDragGroup,
    clearDragGroup,
  }
} 