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
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ulid } from "ulid";
import useZoomPan from "./composables/use-zoom-pan";
import useMouseWheel from "./composables/use-mouse-wheel";
import useKeysPressed from "./composables/keys-pressed";
import buildPointerEvents from "./composables/build-pointer-events";
import InfiniteCanvasBlock from "./infinite-canvas-block.vue";

const container = ref(null);
const dashboard = ref(null);

const nodes = ref([
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
]);

//mouse over
const active = ref(false);
const selected = ref([]);

const { keysPressed, isPressed, isOnlyPressed } = useKeysPressed({
  active,
});

const zoomPan = useZoomPan(container, dashboard, {
  keysPressed,
  active,
});
const zoomF = zoomPan.zoomFactor;
const matrix = zoomPan.matrix;

const { event, down, move, up } = buildPointerEvents({
  stopPropagation: true,
  onPointerDown: (e, event) => {
    console.log("pointer down", e, event);
  },
  onDragStart: (e, event) => {
    if (isPressed(" ")) {
      console.log("drag start", e, event);
      zoomPan.down(e);
      return;
    }
  },
  onDragMove: (e, event) => {
    if (isPressed(" ")) {
      console.log("drag move", e, event);
      zoomPan.move(e);
      return;
    }
  },
  onDragEnd: (e, event) => {
    zoomPan.up(e);

    console.log("drag end", e, event);
  },
  onClick: (e, event) => {
    console.log("click", e, event);
  },
});

const mouseWheel = useMouseWheel(container);
mouseWheel.onWheelEvent((e) => {
  zoomPan.zoom(e);
  zoomPan.scroll(e);
});

//handle block moveable events
const onBlockDragMove = (id, position) => {
  const node = nodes.value.find((node) => node.id === id);

  node.x = position.x;
  node.y = position.y;

  if (node && selected.value.length === 1) {
    // Single item selection - just move the item directly
    //group moveable
  } else if (node && selected.value.length > 1) {
    // Multiple items selected - calculate relative movement
    const deltaX = position.x - node.x;
    const deltaY = position.y - node.y;

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

const onBlockDragEnd = (id) => {
  console.log("block drag end", id);
};
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