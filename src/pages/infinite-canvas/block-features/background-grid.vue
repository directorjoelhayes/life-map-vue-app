<template>
    <canvas ref="canvas" id="gridCanvas"></canvas>
</template>


<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
    matrix: {
        type: Array,
        default: () => [1, 0, 0, 1, 0, 0],
    },
})


const canvas = ref(null);
const ctx = canvas.value.getContext('2d');

// Resize canvas to fill window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Create offscreen dot pattern
function createDotPattern(spacing = 40, radius = 1.5, color = '#aaa') {
  const offCanvas = document.createElement('canvas');
  offCanvas.width = spacing;
  offCanvas.height = spacing;
  const offCtx = offCanvas.getContext('2d');
  
  offCtx.fillStyle = color;
  offCtx.beginPath();
  offCtx.arc(spacing / 2, spacing / 2, radius, 0, 2 * Math.PI);
  offCtx.fill();
  
  return ctx.createPattern(offCanvas, 'repeat');
}

// Transform matrix: [a, b, c, d, e, f]
let transformMatrix = props.matrix; // Identity by default

function drawGrid() {
  ctx.save();
  ctx.setTransform(...transformMatrix); // Apply matrix
  ctx.clearRect(-10000, -10000, 20000, 20000); // clear large area under transform

  const pattern = createDotPattern();
  ctx.fillStyle = pattern;
  ctx.fillRect(-10000, -10000, 20000, 20000); // draw large enough area to cover view

  ctx.restore();
}

// Redraw loop (only needed if transform changes dynamically)
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  requestAnimationFrame(animate);
}
animate();

// Example: set a transform matrix (e.g., scale + translate)
function setTransformFromCSSMatrix(matrix) {
  transformMatrix = matrix;
}

onMounted(() => {
    setTransformFromCSSMatrix(props.matrix);
    drawGrid();
    animate();
});


</script>


<style scoped>

</style>