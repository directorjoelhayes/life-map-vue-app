<template>
    <button id="anchor_2">Open popover</button>
    <div id="popover_2" popover="hint" @mouseover="keepFromClosing" @mouseleave="leavePopover">
      <div class="test">test</div>
    </div>
  </template>

<script setup>
import { onMounted } from "vue";

let keepAlive = null;
let tooltip = null;

onMounted(() => {
  const button = document.getElementById("anchor_2");
  tooltip = document.getElementById("popover_2");

  button.addEventListener("mouseenter", () => {
    if(keepAlive) {
      clearInterval(keepAlive);
    }
    tooltip.showPopover();
    
  });

  button.addEventListener("mouseleave", () => {
    console.log("mouseleave");
    keepAlive = setTimeout(() => {
      tooltip.hidePopover();
    }, 400);
  });


});

const keepFromClosing = () => {
  keepAlive = clearInterval(keepAlive);
}

const leavePopover = () => {
  keepAlive = setTimeout(() => {
    tooltip.hidePopover();
  }, 400);
}
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

#anchor_2 {
  anchor-name: --anchor_2;
}

[popover] {
  position: absolute;
  width: 10rem;
  position-anchor: --anchor_2;
  /* 	top: anchor(--anchor_1 bottom); */
  /* 	left: anchor(--anchor_1 right); */
  color: blue;
  inset-block-start: anchor(--anchor_2 bottom);
  inset-inline-start: anchor(--anchor_2 center);
  transform: translateX(-50%);
  padding: 20px 0px;
  background: transparent;
}

#popover_2 > div {
  border: 1px solid;
  padding: 1rem;
}
</style>

