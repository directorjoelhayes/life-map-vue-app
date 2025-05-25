<template>
  <div
    class="dashboard-item"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    :class="{
      'is-dragging': isDragging,
      'debug-handle': debugHandle,
      selected: isSelected,
    }"
    :style="{
      left: `${props.x}px`,
      top: `${props.y}px`,
      width: `${props.width}px`,
      height: `${props.height}px`,
    }"
  >
    <div class="dashboard-item-content">
      {{ props.selected }}
      <slot name="default">
        {{ title }}
      </slot>
    </div>

    <div
      class="dashboard-item-resize-handle north"
      @pointerdown="handleResizePointerDown($event, 'north')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
    <div
      class="dashboard-item-resize-handle east"
      @pointerdown="handleResizePointerDown($event, 'east')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
    <div
      class="dashboard-item-resize-handle south"
      @pointerdown="handleResizePointerDown($event, 'south')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
    <div
      class="dashboard-item-resize-handle west"
      @pointerdown="handleResizePointerDown($event, 'west')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
    <div
      class="dashboard-item-resize-handle north-west"
      @pointerdown="handleResizePointerDown($event, 'north-west')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
    <div
      class="dashboard-item-resize-handle south-west"
      @pointerdown="handleResizePointerDown($event, 'south-west')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
    <div
      class="dashboard-item-resize-handle south-east"
      @pointerdown="handleResizePointerDown($event, 'south-east')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
    <div
      class="dashboard-item-resize-handle north-east"
      @pointerdown="handleResizePointerDown($event, 'north-east')"
      @pointermove="handleResizePointerMove"
      @pointerup="handleResizePointerUp"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  x: {
    type: Number,
    required: true,
    default: 0,
  },
  y: {
    type: Number,
    required: true,
    default: 0,
  },
  width: {
    type: Number,
    default: 200,
  },
  height: {
    type: Number,
    default: 200,
  },
  selected: {
    type: Array,
    default: [],
  },
});

const isSelected = computed(() => {
  console.log("isSelected", props.selected, props.id);
  return props.selected.includes(props.id);
});

const emit = defineEmits([
  "update:position",
  "update:dragEnd",
  "update:resize",
  "update:resize-end",
  "update:select",
]);

const isDragging = ref(false);
const isResizing = ref(false);
const startX = ref(0);
const startY = ref(0);
const initialX = ref(0);
const initialY = ref(0);
const initialWidth = ref(0);
const initialHeight = ref(0);
const debugHandle = ref(false);
const pointerDown = ref(false);

const handlePointerDown = (event) => {
  pointerDown.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  initialX.value = props.x;
  initialY.value = props.y;
  event.target.setPointerCapture(event.pointerId);
};

const handlePointerMove = (event) => {
  if (!pointerDown.value) return;
  // distance from the startX and startY to the event.clientX and event.clientY
  const distance = Math.sqrt(
    (event.clientX - startX.value) ** 2 + (event.clientY - startY.value) ** 2
  );
  if (distance > 10) {
    isDragging.value = true;
  }
  if (!isDragging.value) return;
  const deltaX = event.clientX - startX.value;
  const deltaY = event.clientY - startY.value;
  emit("update:position", {
    x: initialX.value + deltaX,
    y: initialY.value + deltaY,
  });
};

const handlePointerUp = (event) => {
  if (isDragging.value) {
    if (event.pointerId !== undefined) {
      event.target.releasePointerCapture(event.pointerId);
    }
    isDragging.value = false;

    emit("update:dragEnd");
    // emit("update:select", props.id);
  } else {
    // handle click
    emit("update:select", event.shiftKey);
  }

  pointerDown.value = false;
};

const handleResizePointerDown = (event, direction) => {
  event.stopPropagation();
  isResizing.value = direction;
  startX.value = event.clientX;
  startY.value = event.clientY;
  initialX.value = props.x;
  initialY.value = props.y;
  initialWidth.value = props.width;
  initialHeight.value = props.height;
  event.target.setPointerCapture(event.pointerId);
};

const handleResizePointerMove = (event) => {
  if (!isResizing.value) return;
  const deltaX = event.clientX - startX.value;
  const deltaY = event.clientY - startY.value;
  emit("update:resize", {
    direction: isResizing.value,
    x: initialX.value + deltaX,
    y: initialY.value + deltaY,
    initialWidth: initialWidth.value,
    initialHeight: initialHeight.value,
  });
};

const handleResizePointerUp = (event) => {
  if (isResizing.value) {
    if (event.pointerId !== undefined) {
      event.target.releasePointerCapture(event.pointerId);
    }
    isResizing.value = false;
  }
  emit("update:resize-end");
};
</script>

<style scoped>
.dashboard-item {
  width: 200px;
  height: 200px;
  background-color: var(--surface-400);
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.dashboard-item {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
.dashboard-item.is-dragging {
  box-shadow: 0px 0px 30px var(--primary-400);
  outline-style: solid;
  outline-color: var(--secondary);
  outline-width: 1px;
  z-index: 999999;
}

.dashboard-item {
  background: var(--surface-500);
}

.dashboard-item.selected {
  border-style: solid;
  border-color: var(--primary-400);
  border-width: 1px;
}

.dashboard-item-resize-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: var(--primary);
  border-radius: 3px;
  opacity: 0;
}

.dashboard-item-resize-handle:hover {
  background-color: var(--primary-400);
}

.dashboard-item-resize-handle.debug-handle {
  background-color: var(--secondary);
}

.dashboard-item-resize-handle.north-east {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
  background-color: var(--secondary);
}

.dashboard-item-resize-handle.north-west {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
  background-color: var(--secondary);
}

.dashboard-item-resize-handle.south-east {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
  background-color: var(--secondary);
}

.dashboard-item-resize-handle.south-west {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
  background-color: var(--secondary);
}

.dashboard-item-resize-handle.hide {
  opacity: 0;
}

.dashboard-item-resize-handle.east {
  top: 0;
  right: -5px;
  height: 100%;
  width: 10px;
  cursor: ew-resize;
}

.dashboard-item-resize-handle.west {
  top: 0;
  left: -5px;
  height: 100%;
  width: 10px;
  cursor: w-resize;
}

.dashboard-item-resize-handle.north {
  top: -5px;
  left: 0;
  width: 100%;
  height: 10px;
  cursor: n-resize;
}

.dashboard-item-resize-handle.south {
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 10px;
  cursor: s-resize;
}
</style>


