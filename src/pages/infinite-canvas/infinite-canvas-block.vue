<template>
  <div
    class="infinite-canvas-block"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    :style="{
      width: `${block.width}px`,
      height: `${block.height}px`,
      transform: `translate(${x}px, ${y}px)`,
    }"
  >
    <div class="infinite-canvas-block__header">
      <h2>{{ block.name }}</h2>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import buildPointerEvents from "./composables/build-pointer-events";

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  zoomFactor: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["select", "dragStart", "dragMove", "dragEnd"]);

const { event, down, move, up } = buildPointerEvents({
  stopPropagation: true,
  onPointerDown: (e, event) => {
    console.log("pointer down", e, event);
  },
  onDragStart: (e, event) => {
    console.log("drag start", e, event);
    event.start.position = {
      x: props.x,
      y: props.y,
    }
    e.target.setPointerCapture(e.pointerId);
  },
  onDragMove: (e, event) => {
    console.log(props.zoomFactor.value, "zoom factor");
    const deltaX = (e.clientX - event.start.x) / props.zoomFactor.value;
    const deltaY = (e.clientY - event.start.y) / props.zoomFactor.value;
    const { x, y } = event.start.position;
    emit("update:dragMove", {
      x: x + deltaX,
      y: y + deltaY,
    });
    console.log("drag move", e, event);
  },
  onDragEnd: (e, event) => {
    console.log("drag end", e, event);
    emit("update:dragEnd");
    if (e.pointerId !== undefined) {
      e.target.releasePointerCapture(e.pointerId);
    }
  },
  onClick: (e, event) => {
    console.log("click", e, event);
  },
});
</script>

<style scoped>
.infinite-canvas-block.nodes {
  background-color: var(--surface);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.infinite-canvas-block:hover,
.infinite-canvas-block.selected {
  outline-style: solid;
  outline-width: 1px;
  outline-color: var(--primary);
  cursor: pointer;
}
</style>