<template>
  <div
    class="selection-box"
    v-if="selectedItems.length > 1 || dragStart"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    :style="{
      left: selectionBox.x + 'px',
      top: selectionBox.y + 'px',
      width: selectionBox.width + 'px',
      height: selectionBox.height + 'px',
      display: getDisplay(selectionBox),
    }"
  ></div>
</template>

<script setup>
const props = defineProps({
  selectionBox: {
    type: Object,
    required: true,
  },
  selectedItems: {
    type: Array,
    required: true,
  },
  dragStart: {
    type: Boolean,
    required: true,
  },
});

const getDisplay = (selectionBox) => {
  if (selectionBox.width < 5 && selectionBox.height < 5) {
    return "none";
  }
  return "block";
};

</script>

<style scoped>
.selection-box {
  position: absolute;
  border-style: solid;
  border-color: var(--primary);
  border-width: 1px;
  z-index: 0;
}
</style>






