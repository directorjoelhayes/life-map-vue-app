<template>
  <div class="dashboard-wrapper">
    <LmContainer fluid>
      <Row>
        <div>
          <h1>Dashboard</h1>
        </div>
        
      </Row>
    </LmContainer>
    <div
      class="dashboard-container"
      ref="dashboardContainer"
      @click="onDashboardClick"
      @pointerdown="handleDashboardPointerDown"
      @pointermove="handleDashboardPointerMove"
      @pointerup="handleDashboardPointerUp"
      @pointercancel="handleDashboardPointerUp"
    >
      <DashboardItem
        v-for="item in items"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        :selected="selectedItems"
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
import { onBeforeMount, onMounted } from "vue";
// import { useDashboardStore } from "../../stores/use-dashboard-store";

// const dashboardStore = useDashboardStore();

///---------------------------------------database------------------------------/////
import { BrowserLevel } from "browser-level";

console.log(BrowserLevel, "browser level");

const db = new BrowserLevel("example", { valueEncoding: "json" });

import { ref, watch } from "vue";
import { ulid } from "ulid";

console.log(ulid(), "ulid");

const items = ref([]);

onBeforeMount(async () => {
  const savedItems = await await db.values().all();
  if (savedItems.length === 0) {
    items.value.push({
      id: ulid(),
      title: "Item 1",
      x: 0,
      y: 100,
      width: 200,
      height: 200,
    });
    saveItem(items.value[0]);
  } else {
    items.value.splice(0, items.value.length, ...savedItems);
  }
});

async function saveItem(item) {
  await db.put(item.id, item);
  console.log("item saved:", item);
}

///---------------------------------------dashboard------------------------------/////
const dashboardContainer = ref(null);
const selectedItems = ref([]);
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
  const newSelectedItems = items.value
    .filter((item) => {
      // Check if item overlaps with selection box
      return (
        item.x < box.x + box.width &&
        item.x + item.width > box.x &&
        item.y < box.y + box.height &&
        item.y + item.height > box.y
      );
    })
    .map((item) => item.id);

  selectedItems.value = newSelectedItems;
};

const handleDashboardPointerMove = (event) => {
  console.log(isDragging.value, "is dragging");
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
  console.log("pointer up", event);
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
  //clear selection drag box
  selectionDragBox.value = {
    id: "selection-drag-box",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};

// Keep the existing updateSelectionBox function for multi-select
function updateSelectionBox(selected) {
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
    const selected = items.value.filter((item) => newVal.includes(item.id));
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
  const item = items.value.find((item) => item.id === id);

  if (item && selectedItems.value.length === 1) {
    // Single item selection - just move the item directly
    item.x = position.x;
    item.y = position.y;
  } else if (item && selectedItems.value.length > 1) {
    // Multiple items selected - calculate relative movement
    const deltaX = position.x - item.x;
    const deltaY = position.y - item.y;

    // Move all selected items by the same delta
    [...selectedItems.value, "selection-box"].forEach((selectedId) => {
      const selectedItem = items.value.find((item) => item.id === selectedId);
      if (selectedItem) {
        selectedItem.x += deltaX;
        selectedItem.y += deltaY;
      } else if (selectedId === "selection-box") {
        selectionBox.value.x += deltaX;
        selectionBox.value.y += deltaY;
      }
    });
  }
};

const onDragEnd = (id) => {
  console.log("drag end", id);

  if (selectedItems.value.length === 1) {
    // Single item case
    const item = items.value.find((item) => item.id === id);
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
      const containerWidth = dashboardContainer.value.clientWidth;
      const containerHeight = dashboardContainer.value.clientHeight;

      const newPositions = [];
      // Process all selected items
      selectedItems.value.forEach((selectedId) => {
        const selectedItem = items.value.find((item) => item.id === selectedId);
        if (selectedItem) {
          // Snap to grid
          selectedItem.x = snapToGrid(selectedItem.x);
          selectedItem.y = snapToGrid(selectedItem.y);

          newPositions.push(selectedItem);

          // Apply boundary constraints
          applyBoundaryConstraints(selectedItem);
          saveItem(selectedItem);
        }
      });

      updateSelectionBox(newPositions);

      //apply selection box final position
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
  const item = items.value.find((item) => item.id === id);
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
  const item = items.value.find((item) => item.id === id);
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

const onItemClick = (id, { shiftKey, ctrlKey }) => {
  const newSelectedItems = [...selectedItems.value];
  //if items exist and shift isn't being pressed
  if (
    !shiftKey &&
    newSelectedItems.some((val) => {
      return val !== id;
    })
  ) {
    console.log("single select", id);
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
  //   Only clear selection if the click was directly on the dashboard container
  //   and not on a child element (which would be a dashboard item)
  if (isDragging.value === true) {
    isDragging.value = false;
    return;
  }
  if (event.target === dashboardContainer.value) {
    selectedItems.value = [];
  }
};

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
