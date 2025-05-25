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
      />
    </div>
  </div>
</template>

<script setup>
import LmContainer from "../container/lm-container.vue";
import Row from "../container/row.vue";
import DashboardItem from "./dashboard-item.vue";
import DashboardSelectBox from "./dashboard-select-box.vue";

import { ref, watch } from "vue";
const items = ref([
  { id: 1, title: "Item 1", x: 0, y: 100, width: 200, height: 200 },
  { id: 2, title: "Item 2", x: 100, y: 100, width: 200, height: 200 },
  { id: 3, title: "Item 3", x: 500, y: 100, width: 200, height: 200 },
  { id: 4, title: "Item 4", x: 700, y: 100, width: 200, height: 200 },
]);

const dashboardContainer = ref(null);
const selectedItems = ref([]);
const selectionBox = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

watch(selectedItems, (newVal) => {
  console.log("selectedItems", newVal);
  if (newVal.length > 1) {
    const selected = items.value.filter((item) => newVal.includes(item.id));

    console.log(selected);

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

    console.log({ x, y, width, height }, "selection box");

    selectionBox.value = {
      x: x - 5,
      y: y - 5,
      width: width - x + 10,
      height: height - y + 10,
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
  if (item) {
    item.x = position.x;
    item.y = position.y;
  }
};

const onDragEnd = (id) => {
  console.log("drag end", id);
  const item = items.value.find((item) => item.id === id);
  if (item && dashboardContainer.value) {
    // Snap to grid
    item.x = snapToGrid(item.x);
    item.y = snapToGrid(item.y);

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
  }
};

const onItemClick = (id, shiftKey) => {
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
  // Only clear selection if the click was directly on the dashboard container
  // and not on a child element (which would be a dashboard item)
  if (event.target === dashboardContainer.value) {
    selectedItems.value = [];
  }
};

const handlePointerDown = (event) => {
  console.log("pointer down", event);
};

const handlePointerMove = (event) => {
  console.log("pointer move", event);
};

const handlePointerUp = (event) => {
  console.log("pointer up", event);
};

const handlePointerCancel = (event) => {
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
