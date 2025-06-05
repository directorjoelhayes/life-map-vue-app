import { nextTick } from 'vue'

export function useDashboardResize() {
  
  const handleItemResize = (id, resize, items, snapToGrid, applyConstraints, containerElement, updateSearchBoxRealtime, selectedItems) => {
    const item = items.get(id)
    if (!item) return

    // Handle resize based on direction
    const direction = resize.direction
    const deltaX = resize.x - item.x
    const deltaY = resize.y - item.y

    // Handle different resize directions
    if (direction.includes('east')) {
      item.width = Math.max(100, resize.initialWidth + deltaX)
    }

    if (direction.includes('west')) {
      const newWidth = Math.max(100, item.width - deltaX)
      if (newWidth !== item.width) {
        item.x = item.x + (item.width - newWidth)
        item.width = newWidth
      }
    }

    if (direction.includes('south')) {
      item.height = Math.max(100, resize.initialHeight + deltaY)
    }

    if (direction.includes('north')) {
      const newHeight = Math.max(100, item.height - deltaY)
      if (newHeight !== item.height) {
        item.y = item.y + (item.height - newHeight)
        item.height = newHeight
      }
    }

    // Ensure minimum dimensions
    item.width = Math.max(100, item.width)
    item.height = Math.max(100, item.height)

    // Update search box position in real-time during resize
    updateSearchBoxRealtime(id, selectedItems)
  }

  const handleItemResizeEnd = (id, items, snapToGrid, applyConstraints, containerElement, saveCallback, updateSearchBox, selectedItems) => {
    const item = items.get(id)
    if (!item || !containerElement) return

    // Snap to grid
    item.width = snapToGrid(item.width)
    item.height = snapToGrid(item.height)
    item.x = snapToGrid(item.x)
    item.y = snapToGrid(item.y)

    // Get container dimensions
    const containerWidth = containerElement.clientWidth
    const containerHeight = containerElement.clientHeight

    // Apply boundary constraints for resize
    if (item.x < 0) {
      item.x = 0
    }

    if (item.y < 0) {
      item.y = 0
    }

    if (item.x + item.width > containerWidth) {
      // Prioritize position over size when hitting right boundary
      if (item.x > 0) {
        item.width = containerWidth - item.x
      } else {
        item.width = containerWidth
      }
    }

    if (item.y + item.height > containerHeight) {
      // Prioritize position over size when hitting bottom boundary
      if (item.y > 0) {
        item.height = containerHeight - item.y
      } else {
        item.height = containerHeight
      }
    }

    // Save the item
    saveCallback(item)

    // Update search box position if this item is selected
    if (selectedItems.includes(id)) {
      nextTick(() => updateSearchBox(selectedItems))
    }
  }

  return {
    handleItemResize,
    handleItemResizeEnd,
  }
} 