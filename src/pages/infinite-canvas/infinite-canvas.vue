<template>
  <div
    class="dashboard-container grid"
    ref="container"
    :class="tool"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
  >
    <div
      class="dashboard contents"
      ref="dashboard"
      :style="{ transform: matrix }"
    >
      <infinite-canvas-block
        class="nodes"
        v-for="node in nodes"
        :key="node.id"
        :block="node"
        :x="node.x"
        :y="node.y"
        :zoomFactor="zoomPan.zoomFactor"
        @update:dragMove="onBlockDragMove(node.id, $event)"
        @update:dragEnd="onBlockDragEnd(node.id)"
        @update:click="onBlockClick(node.id, $event)"
      />
      <component 
      :is="selectionBox.dragSelectBox" 
      :selectionBox="selectionBox.selectionBox.value" 
      :dragStart="selectionBox.event" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ulid } from "ulid";
import useZoomPan from "./composables/use-zoom-pan";
import useMouseWheel from "./composables/use-mouse-wheel";
import useKeysPressed from "./composables/keys-pressed";
import buildPointerEvents from "./composables/build-pointer-events";
import buildSelectable from "./composables/build-selectable";
import buildSelectionBox from "./composables/build-select-box";

import InfiniteCanvasBlock from "./infinite-canvas-block.vue";

const container = ref(null);
const dashboard = ref(null);

//mouse over
const active = ref(false);

const nodes = ref([]);

const { keysPressed, isPressed, isOnlyPressed } = useKeysPressed({
  active,
});

const zoomPan = useZoomPan(container, dashboard, {
  keysPressed,
  active,
});

const matrix = zoomPan.matrix;

const selectable = buildSelectable("infinite-canvas", {
});

const selectionBox = buildSelectionBox("infinite-canvas", {
  container: dashboard,
  selected: selectable.selected,
  items: nodes,
  zoomFactor: zoomPan.zoomFactor,
  keysPressed,
});

const { event, down, move, up } = buildPointerEvents({
  stopPropagation: true,
  onPointerDown: (e, event) => {
    console.log("pointer down", e, event);
  },
  onDragStart: (e, event) => {
    if (isPressed(" ")) {
      zoomPan.down(e);
      return;
    }
    selectionBox.onPointerDown(e);
  },
  onDragMove: (e, event) => {
    if (isPressed(" ")) {
      zoomPan.move(e);
      return;
    }
    selectionBox.onPointerMove(e);
  },
  onDragEnd: (e, event) => {
    zoomPan.up(e);
    selectionBox.onPointerUp(e);
  },
  onClick: (e, event) => {
    selectable.onParentClick();
  },
});

const mouseWheel = useMouseWheel(container);
mouseWheel.onWheelEvent((e) => {
  zoomPan.zoom(e);
  zoomPan.scroll(e);
});

//handle block moveable events
const onBlockDragMove = (id, position) => {

  const selected = selectable.selected;

  console.log("block drag move", id, position);

  const node = nodes.value.find((node) => node.id === id);

  console.log(selected.value, "selected");

  if (node && selected.value.length === 1) {
    // Single item selection - just move the item directly
    //group moveable
    node.x = position.x;
    node.y = position.y;
  } else if (node && selected.value.length > 1) {
    // Multiple items selected - calculate relative movement
    const deltaX = position.x - node.x;
    const deltaY = position.y - node.y;

    // Move all selected items by the same delta
    selected.value.forEach((selectedId) => {
      const selectedItem = nodes.value.find((node) => node.id === selectedId);
      if (selectedItem) {
        selectedItem.x += deltaX;
        selectedItem.y += deltaY;
      }
    });

    // Also update the selection box
    // selectionBox.value.x += deltaX;
    // selectionBox.value.y += deltaY;

    // Hide search box during multi-item drag to avoid confusion
    // if (showSearchBox.value) {
    //   showSearchBox.value = false;
    // }
  }
};

const onBlockDragEnd = (id) => {
  console.log("block drag end", id);
};

const onBlockClick = (id, event) => {
  console.log("block click", id, event);
  selectable.onItemClick(id, event);
};


onMounted(() => {
  if (nodes.value.length === 0) {
    nodes.value = [
      {
        id: ulid(),
        name: "Node 1",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      {
        id: ulid(),
        name: "Node 2",
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      },
    ];
  }
});


</script>

<style>
.drag {
  pointer-events: none;
}
</style>

<style scoped>
.dashboard-container {
  overflow: hidden;
}

.dashboard {
  position: relative;
  width: 100%;
  height: 100vh;
  touch-action: none;
  transform-origin: 0 0;
}
</style>