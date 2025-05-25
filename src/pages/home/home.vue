<template>
  <Dashboard />
</template>
  
  <script setup>
import { ref } from "vue";
import Dashboard from "../../components/dashboard/dashboard.vue";

const containerSize = ref(1200);
</script>
  
  <style>
/* .app {
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  } */

.container-wrapper {
  margin: 20px 0;
  transition: width 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  height: 100vh;
}

.controls {
  margin-top: 20px;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
}

.controls input[type="range"] {
  width: 100%;
}

.mode-indicator {
  margin-top: 10px;
  font-weight: 600;
  color: #3b82f6;
}
</style>
  