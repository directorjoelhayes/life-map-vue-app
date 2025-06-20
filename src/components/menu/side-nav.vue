<template>
  <div class="side-nav" :class="{ 'closed': !isOpen }">
    <div class="side-nav-header" id="side-nav-header" @click="isOpen = !isOpen">
      <img :src="logoIcon" alt="logo" />
    </div>
    <div class="side-nav-content">
      <router-link to="/">
        <span class="material-symbols-outlined">home</span>
        <span class="text">Home</span>
      </router-link>
      <router-link to="/apps">
        <span class="material-symbols-outlined">apps</span>
        <span class="text">Apps</span>
      </router-link>
      <router-link to="/infinite-canvas">
        <span class="material-symbols-outlined">draw</span>
        <span class="text">Infinite Canvas</span>
      </router-link>
      <router-link to="/settings">
        <span class="material-symbols-outlined">settings</span>
        <span class="text">Settings</span>
      </router-link>
      <router-link to="/table">
        <span class="material-symbols-outlined">table_chart</span>
        <span class="text">Table</span>
      </router-link>
      <router-link to="/history-database-test">
        <span class="material-symbols-outlined">chat_info</span>
        <span class="text">History Test</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import logoIcon from "../../assets/logo-icon.svg";

import { ref } from "vue";

const isOpen = ref(false);

</script>

<style scoped>


.side-nav {
  padding: 20px;
  width: 250px;
  height: 100vh;
  background-color: var(--background-600);
  color: var(--on-background);
  border-right: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.3s ease;
  /* background-color: #ffffff0f; */
}
.side-nav.closed {
  display: flex;
  flex-flow: column;
  width: 70px;
  padding: 10px;
}
.side-nav.closed .side-nav-content a {
  flex-flow: column;
  padding: 8px;
  gap: 5px;
}
.side-nav.closed .side-nav-content a > .text {
  font-size: 15px;
}
.side-nav.closed .side-nav-header {
  display: flex;
  align-items: center;
  justify-content: center;
}
.side-nav-content {
  display: flex;
  flex-flow: column;
  gap: 15px;
}
.side-nav-content a {
    display: flex;
    align-items: center;
    gap: 17px;
}
.side-nav-content a {
  display: flex;
  font-size: 20px;
  font-weight: 400;
  color: var(--on-surface);
  padding: 10px;
  border-radius: 10px;
}
.side-nav-content a span.material-symbols-outlined {
  color: var(--surface-200)
}
.side-nav-content a:hover, .router-link-active,.router-link-exact-active{

  background-color: var(--surface-500);
  
}
.side-nav-content a:hover span.material-symbols-outlined, a.router-link-active span.material-symbols-outlined, a.router-link-exact-active span.material-symbols-outlined{
  color: var(--primary);
  text-shadow: 0px 0px 10px var(--primary-300);
}
.side-nav-content {
  display: flex;
  flex-flow: column;
}

.side-nav-header {
    margin-bottom: 10px;
}
.side-nav-header img {
  width: 35px;
  height: 60px;
}


</style>
