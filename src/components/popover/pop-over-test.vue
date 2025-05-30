<template>
  <button id="anchor_1" popovertarget="popover_1">Open popover</button>
  <div id="popover_1" popover>
    <div class="test">test</div>
  </div>
</template>

<script setup>
//https://www.youtube.com/watch?v=DNXEORSk4GU
//https://codepen.io/kevinpowell/pen/poMaLjR?%3Feditors=1100
import { onMounted } from "vue";
</script>

<style scoped>
/* Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

button {
  margin-left: 100px;
}

[popover] {
  margin: 0;
  padding: 0;
  border: 0;
}

body {
  padding: 1rem;
  min-height: 100vh;
}

#anchor_1 {
  anchor-name: --anchor_1;
}

[popover] {
  position: absolute;
  width: 10rem;
  position-anchor: --anchor_1;
  /* 	top: anchor(--anchor_1 bottom); */
  /* 	left: anchor(--anchor_1 right); */
  color: blue;
  top: anchor(bottom);
  left: anchor(center);
  transform: translateX(-50%);
  margin: 0;
  /* inset: auto; */
  margin-block-start: 6px;
  background: transparent;
}

#popover_1 > div {
  border: 1px solid;
  padding: 1rem;
}
</style>
