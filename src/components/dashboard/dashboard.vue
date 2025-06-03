<template>
  <div class="dashboard-wrapper">
    <LmContainer fluid>
      <Row>
        <div>
          <h1>Dashboard</h1>
        </div>
      </Row>
      <button @click="dbHistory.undo">undo</button>
      <button @click="dbHistory.redo">redo</button>
    </LmContainer>
    <div
      class="dashboard-container"
      ref="dashboardContainer"
      @click="onDashboardClick"
      @pointerdown="handleDashboardPointerDown"
      @pointermove="handleDashboardPointerMove"
      @pointerup="handleDashboardPointerUp"
      @pointercancel="handleDashboardPointerUp"
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
        @update:position="updateItemPosition(item.id, $event)"
        @update:dragEnd="onDragEnd(item.id, $event)"
        @update:resize="onResize(item.id, $event)"
        @update:resize-end="onResizeEnd(item.id)"
        @update:select="onItemClick(item.id, $event)"
      />
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
    </div>
  </div>
</template>

<script setup>
import LmContainer from "../container/lm-container.vue";
import Row from "../container/row.vue";
import DashboardItem from "./dashboard-item.vue";
import DashboardSelectBox from "./dashboard-select-box.vue";
import composeDataStore from "../../stores/compose-data-store";
import {
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
} from "vue";
import makeDataStore from "../../stores/make-data-store";
// import { useDashboardStore } from "../../stores/use-dashboard-store";

// const dashboardStore = useDashboardStore();

///---------------------------------------database------------------------------/////
// import { BrowserLevel } from "browser-level";

// console.log(BrowserLevel, "browser level");

// const db = new BrowserLevel("example", { valueEncoding: "json" });

import { ref, watch } from "vue";
import { ulid } from "ulid";

console.log(ulid(), "ulid");

const items = reactive(new Map());

const useDbHistory = makeDataStore("dbHistory");
const dbHistory = useDbHistory();

const unsubscribe = composeDataStore({
  store: dbHistory,
  data: items,
  runAfter: async ({data, name, deletedItems}) => {
      //update selected items
      selectedItems.value = selectedItems.value.filter((id) => {
        return data.has(id);
      });

      updateSelectionBox(selectedItems.value.map((id) => items.get(id)));

      await dbHistory.saveDb();
  }
});

async function saveToDb(items) {
  console.log(items, "items");
  await db.batch(items)
}

const mousePosition = reactive({
  x: 0,
  y: 0,
});

const handleMouseMove = (event) => {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
};

onBeforeMount(async () => {

  //clear db
  // await dbHistory.clearDb();

  try {
    await dbHistory.loadDb();
  } catch (error) {
    console.error("Error loading db", error);
  }

  try {
    const savedItems = dbHistory.getAll;

    //remove all items from items
    items.clear();

    savedItems.forEach((item) => {
      items.set(item.id, {...item});
    });
  } catch (error) {
    console.error("Error loading items", error);
  }

  // const id = ulid();
  // dbHistory.put(id, {
  //   id,
  //   title: "Item 1",
  //   x: 0,
  //   y: 100,
  //   width: 200,
  //   height: 200,
  // });

  // items.value.splice(0, items.value.length, ...savedItems);
});

async function saveItem(item) {
  dbHistory.put(item.id, { ...item });
  console.log("item saved:", item);
}

async function saveItems(items) {
  dbHistory.multiPut(items, "saveItems");
}

///---------------------------------------dashboard------------------------------/////
const dashboardContainer = ref(null);
const selectedItems = ref([]);
const dragGroup = ref([]);
const selectionBox = ref({
  id: "selection-box",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

const selectionDragBox = ref({
  id: "selection-drag-box",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

// Add these new variables to track drag state
const isDragging = ref(false);
const dragStartPos = ref({ x: 0, y: 0 });
const dragCurrentPos = ref({ x: 0, y: 0 });

const handleDashboardPointerDown = (event) => {
  // Only start selection box if click was directly on dashboard container
  if (event.target === dashboardContainer.value) {
    isDragging.value = true;
    // Get the mouse position relative to the container
    const rect = dashboardContainer.value.getBoundingClientRect();
    dragStartPos.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    dragCurrentPos.value = { ...dragStartPos.value };

    // Initialize selection box
    selectionDragBox.value = {
      id: "selection-drag-box",
      x: dragStartPos.value.x,
      y: dragStartPos.value.y,
      width: 0,
      height: 0,
    };

    // Clear any previous selection
    selectedItems.value = [];

    // Capture pointer to receive all pointer events
    event.target.setPointerCapture(event.pointerId);
  }
};

// New function to update selection box dimensions during drag
const updateSelectionBoxFromDrag = () => {
  const startX = dragStartPos.value.x;
  const startY = dragStartPos.value.y;
  const currentX = dragCurrentPos.value.x;
  const currentY = dragCurrentPos.value.y;

  // Calculate the top-left corner and dimensions
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  // Update the selection box
  selectionDragBox.value = {
    id: "selection-drag-box",
    x,
    y,
    width,
    height,
  };
};

// New function to select items that fall within the selection box
const selectItemsInBox = () => {
  const box = selectionDragBox.value;
  const newSelectedItems = [];

  // Iterate through Map entries to check each item
  for (const [key, item] of items) {
    // Check if item overlaps with selection box
    if (
      item.x < box.x + box.width &&
      item.x + item.width > box.x &&
      item.y < box.y + box.height &&
      item.y + item.height > box.y
    ) {
      newSelectedItems.push(key);
    }
  }

  selectedItems.value = newSelectedItems;
};

const handleDashboardPointerMove = (event) => {
  if (!isDragging.value) return;

  // Get current position
  const rect = dashboardContainer.value.getBoundingClientRect();
  dragCurrentPos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  // Update selection box
  updateSelectionBoxFromDrag();

  // Find items within the selection box
  selectItemsInBox();
};

const handleDashboardPointerUp = (event) => {

  console.log("pointer up", event, isDragging.value);
  if (!isDragging.value) return;

  // Release pointer capture
  if (event.pointerId !== undefined) {
    event.target.releasePointerCapture(event.pointerId);
  }

  // If the selection box is very small, it might be a click rather than a drag
  // In that case, clear the selection
  if (selectionDragBox.value.width < 5 && selectionDragBox.value.height < 5) {
    selectedItems.value = [];
  }

  // Clear selection drag box
  selectionDragBox.value = {
    id: "selection-drag-box",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  // Reset isDragging flag
  isDragging.value = false;
};

// Keep the existing updateSelectionBox function for multi-select
function updateSelectionBox(selected) {
  if (selected.length === 0) {
    selectionBox.value = {
      id: "selection-box",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    return;
  }

  const { x, y, width, height } = selected.reduce(
    (acc, item) => {
      acc.x = Math.min(acc.x, item.x);
      acc.y = Math.min(acc.y, item.y);
      acc.width = Math.max(acc.width, item.x + item.width);
      acc.height = Math.max(acc.height, item.y + item.height);
      return acc;
    },
    { x: Infinity, y: Infinity, width: 0, height: 0 }
  );

  selectionBox.value = {
    id: "selection-box",
    x: x - 5,
    y: y - 5,
    width: width - x + 10,
    height: height - y + 10,
  };
}

watch(selectedItems, (newVal) => {
  if (newVal.length > 1) {
    const selected = newVal.map((id) => items.get(id)).filter(Boolean);
    updateSelectionBox(selected);
  } else {
    selectionBox.value = {
      id: "selection-box",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }
});

const gridSize = 25;

//snap to grid
const snapToGrid = (value) => {
  //snap to closes grid point
  return Math.round(value / gridSize) * gridSize;
};

const updateItemPosition = (id, position) => {

  const item = items.get(id);

  if (item && selectedItems.value.length === 1) {
    // Single item selection - just move the item directly
    item.x = position.x;
    item.y = position.y;
  } else if (item && selectedItems.value.length > 1) {

    // Multiple items selected - calculate relative movement
    const deltaX = position.x - item.x;
    const deltaY = position.y - item.y;

    // Move all selected items by the same delta
    selectedItems.value.forEach((selectedId) => {
      if(!dragGroup.value.includes(selectedId)) {
        dragGroup.value.push(selectedId);
      }
      const selectedItem = items.get(selectedId);
      if (selectedItem) {
        selectedItem.x += deltaX;
        selectedItem.y += deltaY;
      }
    });

    // Also update the selection box
    selectionBox.value.x += deltaX;
    selectionBox.value.y += deltaY;
  }
};

const onDragEnd = (id) => {
  console.log("drag end", id);

  if (selectedItems.value.length === 1) {
    // Single item case
    const item = items.get(id);
    if (item && dashboardContainer.value) {
      // Snap to grid
      item.x = snapToGrid(item.x);
      item.y = snapToGrid(item.y);

      // Apply boundary constraints
      applyBoundaryConstraints(item);
      saveItem(item);
    }
  } else if (selectedItems.value.length > 1) {
    // Multiple items case
    if (dashboardContainer.value) {
      const newPositions = [];
      // Process all selected items
      selectedItems.value.forEach((selectedId) => {
        const selectedItem = items.get(selectedId);
        if (selectedItem) {
          // Snap to grid
          selectedItem.x = snapToGrid(selectedItem.x);
          selectedItem.y = snapToGrid(selectedItem.y);

          newPositions.push([selectedId, {...selectedItem}]);

          // Apply boundary constraints
          applyBoundaryConstraints(selectedItem);
        }
      });

      //update drag group
      dragGroup.value = [];

      saveItems(newPositions);

      updateSelectionBox(newPositions.map(([key, item]) => item));
    }
  }
};

// Helper function to apply boundary constraints to an item
const applyBoundaryConstraints = (item) => {
  if (!dashboardContainer.value) return;

  // Get container dimensions
  const containerWidth = dashboardContainer.value.clientWidth;
  const containerHeight = dashboardContainer.value.clientHeight;

  // Check left boundary
  if (item.x < 0) {
    item.x = 0;
  }

  // Check top boundary
  if (item.y < 0) {
    item.y = 0;
  }

  // Check right boundary
  if (item.x + item.width > containerWidth) {
    // Snap to right edge (ensuring the item is at least partially visible)
    item.x = Math.max(0, containerWidth - item.width);
  }

  // Check bottom boundary
  if (item.y + item.height > containerHeight) {
    // Snap to bottom edge (ensuring the item is at least partially visible)
    item.y = Math.max(0, containerHeight - item.height);
  }
};

const onResize = (id, resize) => {
  console.log("resize", id, resize);
  const item = items.get(id);
  if (item) {
    // Handle resize based on the direction
    const direction = resize.direction;
    const deltaX = resize.x - item.x;
    const deltaY = resize.y - item.y;

    // Handle different resize directions
    if (direction.includes("east")) {
      // East - adjust width only
      console.log("east", resize.initialWidth, deltaX);
      item.width = Math.max(100, resize.initialWidth + deltaX);
    }

    if (direction.includes("west")) {
      // West - adjust both x position and width
      const newWidth = Math.max(100, item.width - deltaX);
      if (newWidth !== item.width) {
        item.x = item.x + (item.width - newWidth);
        item.width = newWidth;
      }
    }

    if (direction.includes("south")) {
      // South - adjust height only
      console.log("south", resize.initialHeight, deltaY);
      item.height = Math.max(100, resize.initialHeight + deltaY);
    }

    if (direction.includes("north")) {
      // North - adjust both y position and height
      const newHeight = Math.max(100, item.height - deltaY);
      if (newHeight !== item.height) {
        item.y = item.y + (item.height - newHeight);
        item.height = newHeight;
      }
    }

    // Ensure the item doesn't get too small
    item.width = Math.max(100, item.width);
    item.height = Math.max(100, item.height);
  }
};

const onResizeEnd = (id) => {
  console.log("resize end", id);
  const item = items.get(id);
  if (item && dashboardContainer.value) {
    // Snap to grid
    item.width = snapToGrid(item.width);
    item.height = snapToGrid(item.height);
    item.x = snapToGrid(item.x);
    item.y = snapToGrid(item.y);

    // Get container dimensions
    const containerWidth = dashboardContainer.value.clientWidth;
    const containerHeight = dashboardContainer.value.clientHeight;

    // Apply boundary constraints
    // Check left boundary
    if (item.x < 0) {
      item.x = 0;
    }

    // Check top boundary
    if (item.y < 0) {
      item.y = 0;
    }

    // Check right boundary
    if (item.x + item.width > containerWidth) {
      // Prioritize position over size when hitting right boundary
      if (item.x > 0) {
        item.width = containerWidth - item.x;
      } else {
        item.width = containerWidth;
      }
    }

    // Check bottom boundary
    if (item.y + item.height > containerHeight) {
      // Prioritize position over size when hitting bottom boundary
      if (item.y > 0) {
        item.height = containerHeight - item.y;
      } else {
        item.height = containerHeight;
      }
    }

    saveItem(item);
  }
};

const timesClicked = ref(0);

const onItemClick = (id, { shiftKey, ctrlKey }) => {

  timesClicked.value++;

  console.log(timesClicked.value, "timesClicked");
  
  const newSelectedItems = [...selectedItems.value];
  //if items exist and shift isn't being pressed
  if (
    !shiftKey &&
    newSelectedItems.some((val) => {
      return val !== id;
    })
  ) {
    newSelectedItems.splice(0, newSelectedItems.length, id);
    selectedItems.value = newSelectedItems;
    return;
  }

  if (newSelectedItems.includes(id)) {
    newSelectedItems.splice(
      0,
      newSelectedItems.length,
      ...newSelectedItems.filter((item) => item !== id)
    );
  } else {
    newSelectedItems.push(id);
  }

  selectedItems.value = newSelectedItems;
};

const onDashboardClick = (event) => {
  return;
  // Only clear selection if the click was directly on the dashboard container
  // and not on a child element (which would be a dashboard item)
  if (event.target === dashboardContainer.value) {
    selectedItems.value = [];
  }
};

///---------------------------------------hot keys------------------------------/////

function handleKeyDown(event) {
  // Prevent default browser shortcuts for our commands
  if (event.ctrlKey && (event.key === 'z' || event.key === 'y' || (event.shiftKey && event.key === 'Z'))) {
    event.preventDefault();
  }
  
  // Handle all shortcuts directly in the keydown event
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    // Ctrl+Z: Undo
    commands.undo();
  } else if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
    // Ctrl+Y or Ctrl+Shift+Z: Redo
    commands.redo();
  } else if (event.ctrlKey && event.key === 'c') {
    // Ctrl+C: Copy
    commands.copyItem();
  } else if (event.ctrlKey && event.key === 'v') {
    // Ctrl+V: Paste
    commands.pasteItem();
  } else if (event.key === ' ') {
    // Space key handling
    spacePressed = true;
    
    // Start listening for the second key after space
    document.addEventListener('keydown', handleSpaceCombo);
  }
}

// Variable to track space key state
let spacePressed = false;

// Function to handle space + another key combinations
function handleSpaceCombo(event) {
  if (!spacePressed) return;
  
  if (event.key === 'a') {
    // Space+A: Add item
    commands.addItem();
    event.preventDefault();
  } else if (event.key === 'w') {
    // Space+W: Delete item
    commands.deleteItem();
    event.preventDefault();
  }
  
  // Remove this listener after handling the combo
  document.removeEventListener('keydown', handleSpaceCombo);
}

function handleKeyUp(event) {
  if (event.key === ' ') {
    spacePressed = false;
    // Clean up the combo listener if space is released
    document.removeEventListener('keydown', handleSpaceCombo);
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  document.removeEventListener('keydown', handleSpaceCombo);
});

const commands = reactive({
  undo: () => {
    dbHistory.undo();
  },
  redo: () => {
    dbHistory.redo();
  },
  addItem: () => {
    const id = ulid();

    console.log(id, "id", "update");
    
    // Get dashboard container dimensions
    const rect = dashboardContainer.value.getBoundingClientRect();
    
    // Calculate position relative to dashboard
    const relativeX = mousePosition.x - rect.left;
    const relativeY = mousePosition.y - rect.top;
    
    // Snap to grid
    const snappedX = snapToGrid(relativeX);
    const snappedY = snapToGrid(relativeY);
    
    dbHistory.put(id, {
      id,
      title: "Item 1",
      x: snappedX,
      y: snappedY,
      width: 200,
      height: 200,
    });
  },
  deleteItem: () => {
    if(selectedItems.value.length > 1) {
      dbHistory.multiDel(selectedItems.value, "Delete item");
    } else {
      dbHistory.del(selectedItems.value[0]);
    }
  },
  copyItem: () => {
    // Only copy if there's at least one item selected
    if (selectedItems.value.length > 0) {
      // Store the selected items in localStorage or in a variable
      const itemsToCopy = selectedItems.value.map(id => {
        const item = items.get(id);
        return { ...item }; // Create a copy of the item
      });
      localStorage.setItem('dashboardCopiedItems', JSON.stringify(itemsToCopy));
      console.log("Items copied:", itemsToCopy);
    }
  },
  pasteItem: () => {
    // Retrieve copied items
    const copiedItemsJson = localStorage.getItem('dashboardCopiedItems');
    if (copiedItemsJson) {
      const copiedItems = JSON.parse(copiedItemsJson);
      
      // Calculate offset for pasted items
      const offsetX = 50;
      const offsetY = 50;
      
      // Clear current selection first
      selectedItems.value = [];
      
      // Create an array of [id, item] pairs for multiPut
      const newItems = copiedItems.map(item => {
        const newId = ulid();
        // Create new item with offset position
        const newItem = {
          ...item,
          id: newId,
          x: item.x + offsetX,
          y: item.y + offsetY
        };
        
        // Add to selected items
        selectedItems.value.push(newId);
        
        // Return [id, item] pair for multiPut
        return [newId, newItem];
      });
      
      // Use multiPut to add all items at once
      dbHistory.multiPut(newItems, "Paste items");
      
      console.log("Items pasted:", newItems.length);
    }
  },
});

const hotKeys = new Map([
  ["ctrl+z", "undo"],
  ["ctrl+y", "redo"],
  ["ctrl+shift+z", "redo"],
  ["space+a", "addItem"],
  ["space+w", "deleteItem"],
  ["ctrl+c", "copyItem"],
  ["ctrl+v", "pasteItem"]
]);

const handleDashboardPointerCancel = (event) => {
  console.log("pointer cancel", event);
};


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
