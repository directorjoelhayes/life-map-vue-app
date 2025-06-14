<script setup>
import { applyTheme } from "./theme-setup";
import SideNav from "./components/menu/side-nav.vue";
import { onMounted, onUnmounted, ref } from "vue";
const messages = ref([]);
onMounted(() => {
  
  // Listen for messages from the popup.js
  const messageHandler = (event) => {
    messages.value.push(event.data);

    console.log('Message received in Vue app:', event.data);
    
    // Display the message visually (optional)
    const messageDisplay = document.createElement('div');
    messageDisplay.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #4caf50; color: white; padding: 10px; border-radius: 4px; z-index: 1000;';
    messageDisplay.textContent = `Message received: ${JSON.stringify(event.data)}`;
    document.body.appendChild(messageDisplay);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
      document.body.removeChild(messageDisplay);
    }, 3000);
    
  };
  
  window.addEventListener('message', messageHandler);
});

onUnmounted(() => {
  // Clean up the event listener when component is destroyed
  if (messageListener) {
    window.removeEventListener('message', messageListener);
  }
});

// Apply the light theme by default
applyTheme("dark");
</script>

<template>
  <SideNav />
  <div class="main-content" v-view-transition-name="'main-content'">
    <router-view v-view-transition-name="'page-content'" />
  </div>
</template>

<style>
div#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-flow: row;
}
div#app {
  display: flex;
}

h1 {
  font-weight: 100;
  font-size: 2.5rem;
}
h2 {
    font-weight: 400;
}
.main-content {
  flex: 1;
  padding: 20px;
  border-left: solid;
  border-width: 1px;
  border-color: var(--surface);
  background: var(--background-600);
  overflow: scroll;
  scroll-behavior: smooth;
  overscroll-behavior: auto;
  -webkit-overflow-scrolling: touch; /* For iOS devices */
}
#side-nav-header {
  anchor-name: --nav_anchor_1;
}
.lm-container.fluid.dashboard-header {
    position: absolute;
}
.dashboard-header h1 {
    margin: 0px;
}
.dashboard-header {
  position-anchor: --nav_anchor_1;
  top: anchor(center);
  transform: translateY(-50%);
}

.lm-header {
    display: flex; 
    width: 100%;
    align-items: center;
    gap: 5px;
    text-transform:uppercase;
}

.lm-header .material-symbols-outlined {
    font-size: 50px;
    color: var(--background-300);
}

/* View Transition Styles */
::view-transition-new(main-content) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
::view-transition-old(main-content) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

::view-transition-old(page-content) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
::view-transition-new(page-content) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

::view-transition-old(page-content) {
  animation-name: slide-out-left;
}

::view-transition-new(page-content) {
  animation-name: slide-in-right;
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-8px);
    opacity: 0.0;
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(8px);
    opacity: 0.0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fallback for browsers that don't support view transitions */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(page-content),
  ::view-transition-new(page-content) {
    animation-duration: 0.05s;
  }
}
</style>

<style scoped>


:root {
  color: #fff;
  --on-background: #fff;
  --background-700: #121212;
  --background-600: #1e1e1e;
  --background-500: #2e2e2e;
  --background-400: #3e3e3e;
  --background-300: #4e4e4e;
  --background-200: #5e5e5e;
}

body {
  background-color: var(--background-700);
  color: var(--on-background);
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

span.lm-chip {
    border-style: solid;
    border-width: 1px;
    border-color: var(--primary-500);
    padding: 5px;
    font-size: 12px;
    border-radius: 4px;
}
</style>
