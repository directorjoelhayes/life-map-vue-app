import { ref, onMounted, onUnmounted, watch } from 'vue'
import getQuadrant from '../utils/get-quadrant';

export default function useDrawBox( {
    parentEl,
    xStart,
    yStart,
    move,
    active,
    zoom
} = {}) {


  const width = ref(0);
  const height = ref(0);
  const quadrant = ref(2);

  function update(event) {
    const newWidth = (event.x / zoom.value) - (xStart.value);
    const newHeight = (event.y / zoom.value) - (yStart.value);
    quadrant.value = getQuadrant(newWidth, newHeight);
    width.value = Math.abs(newWidth);
    height.value = Math.abs(newHeight);
  }

  watch(move, (newValue) => {
    update(newValue);
  })
  watch(active, (newValue) => {
    if(!newValue) {
      width.value = 0;
      height.value = 0;
    }
  })
//   onUnmounted(() => el.removeEventListener('pointerdown', update))

  return { width, height, quadrant }
}