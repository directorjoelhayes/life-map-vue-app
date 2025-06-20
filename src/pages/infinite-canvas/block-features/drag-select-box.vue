<template>
  <div
    class="selection-box"
    :style="{
      left: (props.selectionBox.x * props.zoomFactor) + 'px',
      top: (props.selectionBox.y * props.zoomFactor) + 'px',
      width: (props.selectionBox.width * props.zoomFactor) + 'px',
      height: (props.selectionBox.height * props.zoomFactor) + 'px',
      display: props.selectionBox.hidden ? 'none' : 'block'
    }"
  >
  </div>
</template>

<script setup>
const props = defineProps({
  selectionBox: {
    type: Object,
    required: true,
  },
  dragStart: {
    type: Boolean,
    required: true,
  },
  zoomFactor: {
    type: Number,
    default: 1,
  },
});



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






