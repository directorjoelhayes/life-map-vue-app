<template>
  <div class="lm-tabs" v-view-transition-name="'app-detail-tabs'">
    <div class="lm-tab-nav">
      <router-link 
        v-for="tab in tabs" 
        :key="tab.name"
        :to="tab.to"
        class="lm-tab-button"
        :class="{ 'active': isActive(tab.to) }"
      >
        <span v-if="tab.icon" class="material-symbols-outlined">{{ tab.icon }}</span>
        {{ tab.label }}
      </router-link>
    </div>
    <div class="lm-tab-content">
      <router-view v-view-transition-name="'tab-content'" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  }
})

const route = useRoute()

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.lm-tabs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lm-tab-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--surface);
  padding-bottom: 0.5rem;
}

.lm-tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px 8px 0 0;
  text-decoration: none;
  color: var(--on-surface);
  background: transparent;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  border-bottom: none;
  font-weight: 500;
}

.lm-tab-button:hover {
  background: var(--surface);
  color: var(--primary-400);
}

.lm-tab-button.active {
  background: var(--surface);
  color: var(--primary-400);
}

.lm-tab-button .material-symbols-outlined {
  font-size: 1.2rem;
}

.lm-tab-content {
  min-height: 400px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* View Transition Styles for Tab Content */
::view-transition-old(tab-content),
::view-transition-new(tab-content) {
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

::view-transition-old(tab-content) {
  animation-name: slide-out-tab;
}

::view-transition-new(tab-content) {
  animation-name: slide-in-tab;
}

@keyframes slide-out-tab {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-20px);
    opacity: 0;
  }
}

@keyframes slide-in-tab {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Keep the header stable during tab transitions */
::view-transition-old(app-detail-header),
::view-transition-new(app-detail-header) {
  animation: none;
}
</style> 