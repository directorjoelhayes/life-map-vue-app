import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'

export function useDashboardKeyboard() {
  let spacePressed = ref(false)
  
  const hotKeys = new Map([
    ['ctrl+z', 'undo'],
    ['ctrl+y', 'redo'],
    ['ctrl+shift+z', 'redo'],
    ['space+a', 'addItem'],
    ['space+w', 'deleteItem'],
    ['ctrl+c', 'copyItem'],
    ['ctrl+v', 'pasteItem'],
    ['p', 'cyclePlacement (when search box visible)'],
    ['+', 'increase teleport threshold (when search box visible)'],
    ['-', 'decrease teleport threshold (when search box visible)'],
  ])

  // Create commands with dependencies injection
  const createCommands = (dependencies) => {
    const {
      dbHistory,
      items,
      selectedItems,
      dashboardContainer,
      mousePosition,
      selectionDragBox,
      itemsComposable,
      search,
      selection,
    } = dependencies

    return reactive({
      undo: () => {
        dbHistory.undo()
      },
      
      redo: () => {
        dbHistory.redo()
      },
      
      addItem: () => {
        // Get dashboard container dimensions
        const rect = dashboardContainer.value.getBoundingClientRect()

        // Calculate position relative to dashboard
        let relativeX = mousePosition.x - rect.left
        let relativeY = mousePosition.y - rect.top
        let width = 200
        let height = 200

        // Use selection drag box if available
        if (selectionDragBox.value.width > 100 && selectionDragBox.value.height > 100) {
          relativeX = selectionDragBox.value.x
          relativeY = selectionDragBox.value.y
          width = selectionDragBox.value.width
          height = selectionDragBox.value.height
        } else if (
          selectionDragBox.value.previousDragBox?.time < Date.now() - 100 &&
          selectionDragBox.value.previousDragBox?.time > Date.now() - 1000
        ) {
          const previousDragBox = selectionDragBox.value.previousDragBox
          if (previousDragBox.width > 100 && previousDragBox.height > 100) {
            relativeX = previousDragBox.x
            relativeY = previousDragBox.y
            width = previousDragBox.width
            height = previousDragBox.height
          }
        }

        width = Math.max(100, width)
        height = Math.max(100, height)

        // Create the item
        const id = itemsComposable.createItem({
          x: relativeX,
          y: relativeY,
          width,
          height,
        })

        // Select the new item
        selection.selectOnly(id)

        // Show search box for the new item
        nextTick(() => {
          setTimeout(() => {
            search.showSearchBoxForItem(id)
          }, 100)
        })
      },
      
      deleteItem: () => {
        if (selectedItems.value.length > 1) {
          itemsComposable.deleteItems(selectedItems.value)
        } else if (selectedItems.value.length === 1) {
          itemsComposable.deleteItem(selectedItems.value[0])
        }
        selection.clearSelection()
      },
      
      copyItem: () => {
        if (selectedItems.value.length > 0) {
          itemsComposable.copyItems(selectedItems.value)
          console.log('Items copied:', selectedItems.value.length)
        }
      },
      
      pasteItem: () => {
        const newItemIds = itemsComposable.pasteItems()
        if (newItemIds.length > 0) {
          selection.selectMultiple(newItemIds)
          console.log('Items pasted:', newItemIds.length)
        }
      },
    })
  }

  // Keyboard event handlers
  const handleKeyDown = (event, commands, search) => {
    // Handle space key
    if (event.key === ' ' && !event.repeat) {
      spacePressed.value = true
      // Add listener for space combinations
      document.addEventListener('keydown', (e) => handleSpaceCombo(e, commands))
      return
    }

    // Handle search box specific shortcuts
    if (search.showSearchBox.value) {
      if (event.key === 'p') {
        search.cyclePlacement()
        event.preventDefault()
        return
      }
      if (event.key === '+' || event.key === '=') {
        search.teleportThreshold.value = Math.min(1000, search.teleportThreshold.value + 50)
        console.log('Teleport threshold increased to:', search.teleportThreshold.value)
        event.preventDefault()
        return
      }
      if (event.key === '-') {
        search.teleportThreshold.value = Math.max(50, search.teleportThreshold.value - 50)
        console.log('Teleport threshold decreased to:', search.teleportThreshold.value)
        event.preventDefault()
        return
      }
    }

    // Handle standard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
          event.preventDefault()
          if (event.shiftKey) {
            commands.redo()
          } else {
            commands.undo()
          }
          break
        case 'y':
          event.preventDefault()
          commands.redo()
          break
        case 'c':
          event.preventDefault()
          commands.copyItem()
          break
        case 'v':
          event.preventDefault()
          commands.pasteItem()
          break
      }
    }
  }

  const handleSpaceCombo = (event, commands) => {
    if (!spacePressed.value) return

    if (event.key === 'a') {
      commands.addItem()
      event.preventDefault()
    } else if (event.key === 'w') {
      commands.deleteItem()
      event.preventDefault()
    }

    // Remove listener after handling
    document.removeEventListener('keydown', handleSpaceCombo)
  }

  const handleKeyUp = (event) => {
    if (event.key === ' ') {
      spacePressed.value = false
      // Clean up the combo listener if space is released
      document.removeEventListener('keydown', handleSpaceCombo)
    }
  }

  // Setup keyboard event listeners
  const setupKeyboardListeners = (commands, search) => {
    const keyDownHandler = (event) => handleKeyDown(event, commands, search)
    const keyUpHandler = (event) => handleKeyUp(event)

    window.addEventListener('keydown', keyDownHandler)
    window.addEventListener('keyup', keyUpHandler)

    return () => {
      window.removeEventListener('keydown', keyDownHandler)
      window.removeEventListener('keyup', keyUpHandler)
      document.removeEventListener('keydown', handleSpaceCombo)
    }
  }

  return {
    spacePressed,
    hotKeys,
    createCommands,
    handleKeyDown,
    handleKeyUp,
    setupKeyboardListeners,
  }
} 