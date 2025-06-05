# Dashboard Composables

This folder contains the refactored dashboard functionality split into logical, reusable composables.

## Structure Overview

### Main Composable
- **`use-dashboard.js`** - The main orchestrator that combines all other composables and provides the complete dashboard API

### Individual Composables

#### `use-dashboard-items.js`
**Responsibility**: Item CRUD operations, database management, grid snapping, boundary constraints
- Item creation, reading, updating, deletion
- Database persistence with history
- Grid snapping and boundary constraint utilities
- Copy/paste functionality

#### `use-dashboard-selection.js` 
**Responsibility**: Selection state management and selection box logic
- Single and multi-item selection
- Selection box rendering and updates
- Drag group management
- Selection intersection calculations

#### `use-dashboard-drag-drop.js`
**Responsibility**: Drag and drop interactions
- Dashboard-level pointer events
- Item drag start/move/end logic
- Mouse position tracking
- Multi-item drag coordination

#### `use-dashboard-search.js`
**Responsibility**: Component search and search box management
- Search box positioning and visibility
- Component search configuration
- Real-time position updates
- Search result handling

#### `use-dashboard-keyboard.js`
**Responsibility**: Keyboard shortcuts and commands
- Hotkey definitions and handling
- Command creation with dependency injection
- Space+key combinations
- Search box specific shortcuts

#### `use-dashboard-resize.js`
**Responsibility**: Item resizing logic
- Resize event handling
- Direction-based size calculations
- Constraint application during resize
- Search box position updates during resize

## Usage

### Simple Usage (Recommended)
```javascript
import { useDashboard } from './composables'

export default {
  setup() {
    const dashboard = useDashboard()
    return {
      ...dashboard
    }
  }
}
```

### Individual Composable Usage
```javascript
import { 
  useDashboardItems, 
  useDashboardSelection 
} from './composables'

export default {
  setup() {
    const items = useDashboardItems()
    const selection = useDashboardSelection()
    
    return {
      ...items,
      ...selection
    }
  }
}
```

## Benefits of This Structure

1. **Separation of Concerns**: Each composable has a single, well-defined responsibility
2. **Reusability**: Individual composables can be used in other contexts
3. **Testability**: Each composable can be unit tested independently
4. **Maintainability**: Easier to locate and modify specific functionality
5. **Code Organization**: Related functionality is grouped together
6. **Dependency Injection**: Composables can work together through dependency injection

## Migration from Original Dashboard

The original `dashboard.vue` (1200+ lines) has been refactored into:
- **Main composable**: ~300 lines
- **Individual composables**: ~100-200 lines each
- **Refactored component**: ~140 lines

This represents a ~85% reduction in the main component size while maintaining all functionality.

## Development

When adding new dashboard features:

1. **Identify the appropriate composable** based on the feature's responsibility
2. **Add the functionality** to that composable
3. **Expose the new functionality** through the composable's return object
4. **Update the main composable** if coordination with other composables is needed
5. **Update this README** if new composables are added

## Testing

Each composable can be tested independently:

```javascript
import { useDashboardItems } from './use-dashboard-items'

test('creates item with correct defaults', () => {
  const { createItem, items } = useDashboardItems()
  const id = createItem({ x: 100, y: 200 })
  const item = items.get(id)
  
  expect(item.x).toBe(100)
  expect(item.y).toBe(200)
  expect(item.width).toBe(200)
  expect(item.height).toBe(200)
})
``` 