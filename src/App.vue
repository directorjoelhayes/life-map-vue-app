<script setup>
import { applyTheme } from "./theme-setup";
import SideNav from "./components/menu/side-nav.vue";

// Apply the light theme by default
applyTheme("dark");
</script>

<template>
  <SideNav />
  <div class="main-content">
    <router-view />
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


</style>

<style scoped>
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
</style>
