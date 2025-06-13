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
        :widget="item.widget"
        :componentInfo="item.widget ? componentDisplay[item.widget] : {}"
        @update:position="updateItemPosition(item.id, $event)"
        @update:dragEnd="onDragEnd(item.id, $event)"
        @update:resize="onResize(item.id, $event)"
        @update:resize-end="onResizeEnd(item.id)"
        @update:select="onItemClick(item.id, $event)"
      >
        <template
          v-if="
            item.widget &&
            componentMap[item.widget] &&
            componentDisplay[item.widget]
          "
          #default="slotProps"
        >
          <component
            :is="componentMap[item.widget]"
            :componentInfo="componentDisplay[item.widget]"
            :lockContent="slotProps.lockContent"
            :itemId="slotProps.itemId"
            :selected="slotProps.selected"
          />
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
        ref="searchBox"
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
import LmContainer from "../container/lm-container.vue";
import Row from "../container/row.vue";
import DashboardItem from "./dashboard-item.vue";
import DashboardSelectBox from "./dashboard-select-box.vue";
import composeDataStore from "../../stores/compose-data-store";
import SearchBox from "../search-box/search-box.vue";
import fuzzySearch from "fuzzy-search";

//widgets
import YoutubeMusic from "/src/widgets/youtube-music.vue";
import Note from "/src/widgets/note.vue";
import Text from "/src/widgets/text.vue";
import TodoListDaily from "/src/widgets/todo-list-daily.vue";
import EventCalendar from "/src/widgets/event-calendar.vue";

import {
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  nextTick,
} from "vue";
import makeDataStore from "../../stores/make-data-store";

import { ref, watch } from "vue";
import { ulid } from "ulid";

console.log(ulid(), "ulid");

const items = reactive(new Map());
const searchBoxTarget = ref(null); // Target element for positioning
const showSearchBox = ref(false); // Control search box visibility
const searchBoxPlacement = ref("bottom-center"); // Current placement
const teleportThreshold = ref(500); // Distance threshold for instant teleportation

const placementOptions = [
  "bottom-center",
  "bottom-left",
  "bottom-right",
  "top-center",
  "right-center",
  "left-center",
];

// Cycle through placement options (for testing/demos)
const cyclePlacement = () => {
  const currentIndex = placementOptions.indexOf(searchBoxPlacement.value);
  const nextIndex = (currentIndex + 1) % placementOptions.length;
  searchBoxPlacement.value = placementOptions[nextIndex];
  console.log("Search box placement:", searchBoxPlacement.value);
};

const useDbHistory = makeDataStore("dbHistory");
const dbHistory = useDbHistory();

const unsubscribe = composeDataStore({
  store: dbHistory,
  data: items,
  runAfter: async ({ data, name, deletedItems }) => {
    //update selected items
    selectedItems.value = selectedItems.value.filter((id) => {
      return data.has(id);
    });

    updateSelectionBox(selectedItems.value.map((id) => items.get(id)));

    dbHistory.saveDb();
  },
});

async function saveToDb(items) {
  console.log(items, "items");
  await db.batch(items);
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
      items.set(item.id, { ...item });
    });
  } catch (error) {
    console.error("Error loading items", error);
  }
});

async function saveItem(item) {
  console.log(item, "item");
  dbHistory.put(item.id, { ...item });
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

const selectionDragBoxDefaults = {
  id: "selection-drag-box",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

const selectionDragBox = ref({
  ...selectionDragBoxDefaults,
});

//
const pointerDown = ref(false);

// Add these new variables to track drag state
const isDragging = ref(false);
const dragStartPos = ref({
  x: 0,
  y: 0,
});
const dragCurrentPos = ref({
  x: 0,
  y: 0,
});
const isMovingItems = ref(false);

const handleDashboardPointerDown = (event) => {
  pointerDown.value = true;
  // Only start selection box if click was directly on dashboard container
  if (event.target === dashboardContainer.value) {
    // isDragging.value = true;
    // Get the mouse position relative to the container
    const rect = dashboardContainer.value.getBoundingClientRect();
    dragStartPos.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    dragCurrentPos.value = { ...dragStartPos.value };

    // Initialize selection box
    selectionDragBox.value = {
      ...selectionDragBoxDefaults,
      x: dragStartPos.value.x,
      y: dragStartPos.value.y,
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

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const handleDashboardPointerMove = (event) => {
  // Get current position
  const rect = dashboardContainer.value.getBoundingClientRect();
  dragCurrentPos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  if (
    dragStartPos.value.x &&
    dragStartPos.value.y &&
    !isDragging.value &&
    pointerDown.value
  ) {
    if (distance(dragStartPos.value, dragCurrentPos.value) > 10) {
      isDragging.value = true;
    }
  }

  if (!isDragging.value) return;

  // Update selection box
  updateSelectionBoxFromDrag();
  // Find items within the selection box
  selectItemsInBox();
};

const handleDashboardPointerUp = (event) => {
  pointerDown.value = false;

  if (!isDragging.value) {
    if (showSearchBox.value) {
      showSearchBox.value = false;
    }
    return;
  }

  // Release pointer capture
  if (event.pointerId !== undefined) {
    event.target.releasePointerCapture(event.pointerId);
  }

  // If the selection box is very small, it might be a click rather than a drag
  // Check BEFORE resetting the selection box
  if (selectionDragBox.value.width < 5 && selectionDragBox.value.height < 5) {
    selectedItems.value = [];
  }

  // Reset isDragging flag
  isDragging.value = false;
  dragStartPos.value = {
    x: 0,
    y: 0,
  };
  dragCurrentPos.value = {
    x: 0,
    y: 0,
  };

  const previousDragBox = {
    ...selectionDragBox.value,
    time: Date.now(),
  };

  // Reset selection drag box AFTER checking its dimensions
  selectionDragBox.value = {
    ...selectionDragBoxDefaults,
    previousDragBox,
  };
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
  isMovingItems.value = true;

  const item = items.get(id);

  if (item && selectedItems.value.length === 1) {
    // Single item selection - just move the item directly
    item.x = position.x;
    item.y = position.y;

    // Update search box position in real-time if this item is selected and search box is visible
    if (selectedItems.value.includes(id) && showSearchBox.value) {
      updateSearchBoxPositionRealtime(id);
    }
  } else if (item && selectedItems.value.length > 1) {
    // Multiple items selected - calculate relative movement
    const deltaX = position.x - item.x;
    const deltaY = position.y - item.y;

    // Move all selected items by the same delta
    selectedItems.value.forEach((selectedId) => {
      if (!dragGroup.value.includes(selectedId)) {
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

    // Hide search box during multi-item drag to avoid confusion
    if (showSearchBox.value) {
      showSearchBox.value = false;
    }
  }
};

const onDragEnd = (id) => {
  console.log(id, "id", "onDragEnd");
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

      // Update search box position if this item is selected
      if (selectedItems.value.includes(id)) {
        nextTick(() => updateSearchBoxPosition());
      }
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

          newPositions.push([selectedId, { ...selectedItem }]);

          // Apply boundary constraints
          applyBoundaryConstraints(selectedItem);

          //update selection
        }
      });

      //update drag group
      dragGroup.value = [];

      saveItems(newPositions);

      updateSelectionBox(newPositions.map(([key, item]) => item));

      //update selection
      newPositions.forEach(([key, item]) => {
        if (!selectedItems.value.includes(key)) {
          selectedItems.value.push(key);
        }
      });
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

    // Update search box position in real-time during resize
    updateSearchBoxPositionRealtime(id);
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

    // Update search box position if this item is selected
    if (selectedItems.value.includes(id)) {
      nextTick(() => updateSearchBoxPosition());
    }
  }
};

const timesClicked = ref(0);

const onItemClick = (id, { shiftKey, ctrlKey }) => {
  if (isMovingItems.value) {
    isMovingItems.value = false;
    return;
  }

  timesClicked.value++;

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
  // if (showSearchBox.value) {
  //   showSearchBox.value = false;
  // }
};

///---------------------------------------hot keys------------------------------/////

function handleKeyDown(event) {
  // Prevent default browser shortcuts for our commands
  if (
    event.ctrlKey &&
    (event.key === "z" ||
      event.key === "y" ||
      (event.shiftKey && event.key === "Z"))
  ) {
    event.preventDefault();
  }

  // Handle all shortcuts directly in the keydown event
  if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
    // Ctrl+Z: Undo
    commands.undo();
  } else if (
    (event.ctrlKey && event.key === "y") ||
    (event.ctrlKey && event.shiftKey && event.key === "Z")
  ) {
    // Ctrl+Y or Ctrl+Shift+Z: Redo
    commands.redo();
  } else if (event.ctrlKey && event.key === "c") {
    // Ctrl+C: Copy
    commands.copyItem();
  } else if (event.ctrlKey && event.key === "v") {
    // Ctrl+V: Paste
    commands.pasteItem();
  } else if (event.key === "p" && showSearchBox.value) {
    // P: Cycle search box placement (only when search box is visible)
    cyclePlacement();
    event.preventDefault();
  } else if (event.key === "+" && showSearchBox.value) {
    // +: Increase teleport threshold
    teleportThreshold.value += 25;
    console.log("Teleport threshold increased to:", teleportThreshold.value);
    event.preventDefault();
  } else if (event.key === "-" && showSearchBox.value) {
    // -: Decrease teleport threshold
    teleportThreshold.value = Math.max(25, teleportThreshold.value - 25);
    console.log("Teleport threshold decreased to:", teleportThreshold.value);
    event.preventDefault();
  } else if (event.key === "c" && selectedItems.value.length === 1) {
    commands.changeWidget();
    event.preventDefault();
  } else if (event.key === " ") {
    // Space key handling
    spacePressed = true;

    // Start listening for the second key after space
    document.addEventListener("keydown", handleSpaceCombo);
  }
}

// Variable to track space key state
let spacePressed = false;

// Function to handle space + another key combinations
function handleSpaceCombo(event) {
  if (!spacePressed) return;

  if (event.key === "a") {
    // Space+A: Add item
    commands.addItem();
    event.preventDefault();
  } else if (event.key === "w") {
    // Space+W: Delete item
    commands.deleteItem();
    event.preventDefault();
  } else if (event.key === "c") {
    // commands.changeWidget();
    // event.preventDefault();
  }

  // Remove this listener after handling the combo
  document.removeEventListener("keydown", handleSpaceCombo);
}

function handleKeyUp(event) {
  if (event.key === " ") {
    spacePressed = false;
    // Clean up the combo listener if space is released
    document.removeEventListener("keydown", handleSpaceCombo);
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", updateSearchBoxPosition);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  window.removeEventListener("resize", updateSearchBoxPosition);
  document.removeEventListener("keydown", handleSpaceCombo);

  // Cleanup any pending animation frames
  if (updateSearchBoxFrame) {
    cancelAnimationFrame(updateSearchBoxFrame);
  }
});

const hotKeys = new Map([
  ["ctrl+z", "undo"],
  ["ctrl+y", "redo"],
  ["ctrl+shift+z", "redo"],
  ["space+a", "addItem"],
  ["space+w", "deleteItem"],
  ["ctrl+c", "copyItem"],
  ["ctrl+v", "pasteItem"],
  ["p", "cyclePlacement (when search box visible)"],
  ["+", "increase teleport threshold (when search box visible)"],
  ["-", "decrease teleport threshold (when search box visible)"],
]);

const handleDashboardPointerCancel = (event) => {
  console.log("pointer cancel", event);
};

const commands = reactive({
  undo: () => {
    dbHistory.undo();
  },
  redo: () => {
    dbHistory.redo();
  },
  addItem: () => {
    const id = ulid();

    // Get dashboard container dimensions
    const rect = dashboardContainer.value.getBoundingClientRect();

    // Calculate position relative to dashboard
    let relativeX = mousePosition.x - rect.left;
    let relativeY = mousePosition.y - rect.top;
    let width = 200;
    let height = 200;

    if (
      selectionDragBox.value.width > 100 &&
      selectionDragBox.value.height > 100
    ) {
      relativeX = selectionDragBox.value.x;
      relativeY = selectionDragBox.value.y;
      width = selectionDragBox.value.width;
      height = selectionDragBox.value.height;
    } else if (
      selectionDragBox.value.previousDragBox?.time < Date.now() - 100 &&
      selectionDragBox.value.previousDragBox?.time > Date.now() - 1000
    ) {
      const previousDragBox = selectionDragBox.value.previousDragBox;

      if (previousDragBox.width > 100 && previousDragBox.height > 100) {
        relativeX = previousDragBox.x;
        relativeY = previousDragBox.y;
        width = previousDragBox.width;
        height = previousDragBox.height;
      }
    }

    width = Math.max(100, width);
    height = Math.max(100, height);

    // Snap to grid
    const snappedX = snapToGrid(relativeX);
    const snappedY = snapToGrid(relativeY);

    dbHistory.put(id, {
      id,
      title: "Item 1",
      x: snappedX,
      y: snappedY,
      width,
      height,
    });

    selectedItems.value.push(id);

    // Wait for the item to be rendered, then show search box
    nextTick(() => {
      setTimeout(() => {
        const itemElement = getDashboardItemElement(id);
        console.log(itemElement, "itemElement");
        if (itemElement) {
          searchBoxTarget.value = getElementBounds(itemElement);
          showSearchBox.value = true;
        }
      }, 100);
    });
  },
  deleteItem: () => {
    if (selectedItems.value.length > 1) {
      dbHistory.multiDel(selectedItems.value, "Delete item");
    } else {
      dbHistory.del(selectedItems.value[0]);
    }
  },
  copyItem: () => {
    // Only copy if there's at least one item selected
    if (selectedItems.value.length > 0) {
      // Store the selected items in localStorage or in a variable
      const itemsToCopy = selectedItems.value.map((id) => {
        const item = items.get(id);
        return { ...item }; // Create a copy of the item
      });
      localStorage.setItem("dashboardCopiedItems", JSON.stringify(itemsToCopy));
      console.log("Items copied:", itemsToCopy);
    }
  },
  pasteItem: () => {
    // Retrieve copied items
    const copiedItemsJson = localStorage.getItem("dashboardCopiedItems");
    if (copiedItemsJson) {
      const copiedItems = JSON.parse(copiedItemsJson);

      // Calculate offset for pasted items
      const offsetX = 50;
      const offsetY = 50;

      // Clear current selection first
      selectedItems.value = [];

      // Create an array of [id, item] pairs for multiPut
      const newItems = copiedItems.map((item) => {
        const newId = ulid();
        // Create new item with offset position
        const newItem = {
          ...item,
          id: newId,
          x: item.x + offsetX,
          y: item.y + offsetY,
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
  changeWidget: () => {
    //show search box
    const itemElement = getDashboardItemElement(selectedItems.value[0]);
    if (itemElement) {
      searchBoxTarget.value = getElementBounds(itemElement);
      showSearchBox.value = true;
    }
  },
});

// Register components for dynamic rendering
const componentMap = {
  "youtube-music": YoutubeMusic,
  note: Note,
  text: Text,
  "todo-list-daily": TodoListDaily,
  "event-calendar": EventCalendar,
};

const componentSearch = new Map([
  [
    "youtube-music",
    {
      name: "Youtube Music",
      description: "Youtube Music",
      icon: "youtube_activity",
      label: "Youtube Music",
      display: {
        flat: true,
        transparent: false,
        border: true,
      },
    },
  ],
  [
    "note",
    {
      name: "Note",
      description: "Note",
      icon: "note",
      label: "Note",
      tags: ["note", "note-editor"],
      display: {
        flat: true,
        transparent: false,
        border: false,
      },
    },
  ],
  [
    "text",
    {
      name: "Text",
      description: "Text",
      icon: "description",
      tags: ["text", "text-editor"],
      display: {
        flat: true,
        transparent: true,
        border: false,
      },
    },
  ],
  [
    "todo-list-daily",
    {
      name: "Todo List: Daily",
      description: "Todo List: Daily",
      tags: ["todo", "list", "daily"],
      icon: "list_alt_check",
      display: {
        flat: true,
        transparent: false,
        border: false,
      },
    },
  ],
  [
    "event-calendar",
    {
      name: "Event Calendar",
      description: "Event Calendar",
      tags: ["event", "calendar"],
      icon: "calendar_month",
      display: {
        flat: true,
        transparent: false,
        border: true,
      },
    },
  ],
]);

const componentDisplay = reactive(
  Array.from(componentSearch.entries()).reduce((acc, [key, item]) => {
    // Provide default display properties if not specified
    acc[key] = item.display || {
      flat: false,
      transparent: false,
      border: true,
    };
    return acc;
  }, {})
);

// Add debug logging to see what's in componentDisplay
console.log("componentDisplay:", componentDisplay);

const handleSearchBoxEnter = (result) => {
  console.log(result, "result");

  if (result) {
    if (selectedItems.value.length === 1) {
      const itemId = selectedItems.value[0];
      const item = items.get(itemId);
      if (item) {
        item.widget = result.id;
      }
    }
  }
};

const searchResults = ref([
  ...componentSearch.entries().map(([key, item]) => ({ ...item, id: key })),
]);

const onSearch = (search) => {
  console.log(search, "search");
  const results = new fuzzySearch(
    Array.from(componentSearch.entries()).map(([key, item]) => ({
      ...item,
      id: key,
    })),
    ["name", "description", "tags"],
    {
      caseSensitive: false,
    }
  );
  searchResults.value.splice(
    0,
    searchResults.value.length,
    ...results.search(search)
  );
};

const onSelectSearchResult = (result) => {
  // If there's a selected item, update it with the widget
  if (selectedItems.value.length === 1) {
    const itemId = selectedItems.value[0];
    const item = items.get(itemId);
    if (item) {
      item.widget = result.id;
      if (result.display) {
        // Apply display properties if available
        Object.assign(item, result.display);
      }
      saveItem(item);
    }
  }
  // Hide search box after selection
  showSearchBox.value = false;
};

// Add a handler for when the search box closes
const handleSearchBoxClose = () => {
  showSearchBox.value = false;
  // Optional: clear selection when search box closes
  // selectedItems.value = [];
};

// Helper function to get element position and dimensions
const getElementBounds = (element) => {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
};

// Helper function to get dashboard item element
const getDashboardItemElement = (itemId) => {
  return document.getElementById(itemId);
};

// Update search box position for currently selected item
const updateSearchBoxPosition = () => {
  if (showSearchBox.value && selectedItems.value.length === 1) {
    const itemId = selectedItems.value[0];
    const itemElement = getDashboardItemElement(itemId);
    if (itemElement) {
      searchBoxTarget.value = getElementBounds(itemElement);
    }
  }
};

// Update search box position in real-time during dragging/resizing
let updateSearchBoxFrame = null;
const updateSearchBoxPositionRealtime = (id) => {
  if (selectedItems.value.includes(id) && showSearchBox.value) {
    // Cancel any pending frame to avoid excessive updates
    if (updateSearchBoxFrame) {
      cancelAnimationFrame(updateSearchBoxFrame);
    }

    // Schedule update for next frame
    updateSearchBoxFrame = requestAnimationFrame(() => {
      const itemElement = getDashboardItemElement(id);
      if (itemElement) {
        searchBoxTarget.value = getElementBounds(itemElement);
      }
      updateSearchBoxFrame = null;
    });
  }
};

// Development helper - expose some functions globally for testing
if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.dashboardDebug = {
    updateSearchBoxPosition,
    updateSearchBoxPositionRealtime,
    cyclePlacement,
    getElementBounds,
    getDashboardItemElement,
    get teleportThreshold() {
      return teleportThreshold.value;
    },
    set teleportThreshold(value) {
      teleportThreshold.value = value;
    },
    get searchBoxPlacement() {
      return searchBoxPlacement.value;
    },
    set searchBoxPlacement(value) {
      searchBoxPlacement.value = value;
    },
  };
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
  