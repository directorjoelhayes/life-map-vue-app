import { ref, reactive, nextTick } from 'vue'

export function useDashboardDragDrop() {
  const isDragging = ref(false)
  const isMovingItems = ref(false)
  const pointerDown = ref(false)
  
  const dragStartPos = ref({ x: 0, y: 0 })
  const dragCurrentPos = ref({ x: 0, y: 0 })

  // Mouse position tracking
  const mousePosition = reactive({ x: 0, y: 0 })

  const handleMouseMove = (event) => {
    mousePosition.x = event.clientX
    mousePosition.y = event.clientY
  }

  // Dashboard pointer events
  const handleDashboardPointerDown = (event, dashboardContainer, selection) => {
    pointerDown.value = true
    
    if (event.target === dashboardContainer) {
      const rect = dashboardContainer.getBoundingClientRect()
      dragStartPos.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      dragCurrentPos.value = { ...dragStartPos.value }

      // Initialize selection box
      selection.resetSelectionDragBox()
      selection.updateSelectionDragBox(dragStartPos.value, dragCurrentPos.value)

      // Clear any previous selection
      selection.clearSelection()

      // Capture pointer
      event.target.setPointerCapture(event.pointerId)
    }
  }

  const handleDashboardPointerMove = (event, dashboardContainer, selection, items) => {
    if (!pointerDown.value) return
    if (event.target !== dashboardContainer) return

    const rect = dashboardContainer.getBoundingClientRect()
    dragCurrentPos.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    // Check if we should start dragging (minimum distance threshold)
    const distance = Math.sqrt(
      (dragCurrentPos.value.x - dragStartPos.value.x) ** 2 +
      (dragCurrentPos.value.y - dragStartPos.value.y) ** 2
    )

    if (distance > 10) {
      isDragging.value = true
    }

    if (isDragging.value) {
      // Update selection drag box
      selection.updateSelectionDragBox(dragStartPos.value, dragCurrentPos.value)

      // Check for items in selection
      if (selection.selectionDragBox.value.width > 5 && selection.selectionDragBox.value.height > 5) {
        const selectedIds = selection.getItemsInSelectionBox(items, selection.selectionDragBox.value)
        selection.selectMultiple(selectedIds)
      }
    }
  }

  const handleDashboardPointerUp = (event, dashboardContainer, selection) => {
    if (pointerDown.value && event.target === dashboardContainer) {
      // Store the drag box info for potential use
      const dragBoxInfo = {
        ...selection.selectionDragBox.value,
        time: Date.now()
      }
      
      if (selection.selectionDragBox.value.width > 5 && selection.selectionDragBox.value.height > 5) {
        selection.selectionDragBox.value.previousDragBox = dragBoxInfo
      }

      // Release pointer capture
      if (event.pointerId !== undefined) {
        event.target.releasePointerCapture(event.pointerId)
      }

      // Reset drag box
      selection.resetSelectionDragBox()
    }

    // Reset drag state
    isDragging.value = false
    pointerDown.value = false
  }

  // Item drag handlers
  const handleItemDragStart = (id, event, selection) => {
    if (!selection.selectedItems.value.includes(id)) {
      selection.selectOnly(id)
    }
  }

  const handleItemDragMove = (id, position, items, selection, updateCallback) => {
    const item = items.get(id)
    if (!item) return

    if (selection.selectedItems.value.length === 1) {
      // Single item drag
      updateCallback(id, position)
    } else if (selection.selectedItems.value.length > 1) {
      // Multiple items drag
      const deltaX = position.x - item.x
      const deltaY = position.y - item.y

      // Move all selected items
      selection.selectedItems.value.forEach(selectedId => {
        selection.addToDragGroup(selectedId)
        const selectedItem = items.get(selectedId)
        if (selectedItem) {
          selectedItem.x += deltaX
          selectedItem.y += deltaY
        }
      })

      // Update selection box
      const selectedItemsData = selection.selectedItems.value.map(id => items.get(id)).filter(Boolean)
      selection.updateSelectionBox(selectedItemsData)
    }
  }

  const handleItemDragEnd = (id, items, selection, saveCallback, snapToGrid, applyConstraints, containerElement) => {
    if (selection.selectedItems.value.length === 1) {
      // Single item case
      const item = items.get(id)
      if (item && containerElement) {
        // Snap to grid and apply constraints
        item.x = snapToGrid(item.x)
        item.y = snapToGrid(item.y)
        applyConstraints(item, containerElement)
        saveCallback(item)

        // Update selection box
        nextTick(() => {
          selection.updateSelectionBox([item])
        })
      }
    } else if (selection.selectedItems.value.length > 1) {
      // Multiple items case
      if (containerElement) {
        const updatedItems = []
        
        selection.selectedItems.value.forEach(selectedId => {
          const selectedItem = items.get(selectedId)
          if (selectedItem) {
            // Snap to grid and apply constraints
            selectedItem.x = snapToGrid(selectedItem.x)
            selectedItem.y = snapToGrid(selectedItem.y)
            applyConstraints(selectedItem, containerElement)
            updatedItems.push([selectedId, { ...selectedItem }])
          }
        })

        // Clear drag group
        selection.clearDragGroup()

        // Save all items
        saveCallback(updatedItems)

        // Update selection box
        const selectedItemsData = updatedItems.map(([_, item]) => item)
        selection.updateSelectionBox(selectedItemsData)
      }
    }
  }

  return {
    // State
    isDragging,
    isMovingItems,
    pointerDown,
    dragStartPos,
    dragCurrentPos,
    mousePosition,

    // Mouse tracking
    handleMouseMove,

    // Dashboard drag events
    handleDashboardPointerDown,
    handleDashboardPointerMove,
    handleDashboardPointerUp,

    // Item drag events
    handleItemDragStart,
    handleItemDragMove,
    handleItemDragEnd,
  }
} 