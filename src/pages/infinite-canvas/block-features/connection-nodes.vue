<template>
  <div
    class="selection-box"
    :style="{
      left: props.selectionBox.x + 'px',
      top: props.selectionBox.y + 'px',
      width: props.selectionBox.width + 'px',
      height: props.selectionBox.height + 'px',
    }"
  ></div>
</template>
  
<script setup>
const props = defineProps({
  groupBox: {
    type: Object,
    required: true,
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
  
  
  
  
  
  
  