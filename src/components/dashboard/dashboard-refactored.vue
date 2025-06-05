<template>
  <div class="dashboard-wrapper">
    <LmContainer fluid class="dashboard-header">
      <Row>
        <div id="anchor_1">
          <h1>Dashboard</h1>
        </div>
      </Row>
    </LmContainer>
    
    <div
      class="dashboard-container"
      ref="dashboardContainer"
      @click="onDashboardClick"
      @pointerdown="handleDashboardPointerDown"
      @pointermove="handleDashboardPointerMove"
      @pointerup="handleDashboardPointerUp"
      @pointercancel="handleDashboardPointerUp"
      @mousemove="handleMouseMove"
    >
      <DashboardItem
        v-for="[key, item] in items"
        :key="key"
        :id="item.id"
        :title="item.title"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        :selected="selectedItems"
        :dragGroup="dragGroup"
        :widget="item.widget"
        @update:position="updateItemPosition(item.id, $event)"
        @update:dragEnd="onDragEnd(item.id, $event)"
        @update:resize="onResize(item.id, $event)"
        @update:resize-end="onResizeEnd(item.id)"
        @update:select="onItemClick(item.id, $event)"
      >
        <template v-if="item.widget && componentMap[item.widget]" #default="{ lockContent }">
          <component :is="componentMap[item.widget]" :lockContent="lockContent" />
        </template>
      </DashboardItem>

      <DashboardSelectBox
        :selectedItems="selectedItems"
        :selectionBox="selectionBox"
        :dragStart="isDragging"
      />
      
      <DashboardSelectBox
        :selectedItems="selectedItems"
        :selectionBox="selectionDragBox"
        :dragStart="isDragging"
      />

      <SearchBox
        :results="searchResults"
        :targetElement="searchBoxTarget"
        :show="showSearchBox"
        :placement="searchBoxPlacement"
        :teleportThreshold="teleportThreshold"
        @search="onSearch"
        @close="handleSearchBoxClose"
        @select="onSelectSearchResult"
        @enter="handleSearchBoxEnter"
      />
    </div>
  </div>
</template>

<script setup>
import LmContainer from '../container/lm-container.vue'
import Row from '../container/row.vue'
import DashboardItem from './dashboard-item.vue'
import DashboardSelectBox from './dashboard-select-box.vue'
import SearchBox from '../search-box/search-box.vue'
import { useDashboard } from './composables/use-dashboard.js'

// Use the main dashboard composable
const {
  // Refs
  dashboardContainer,
  
  // Data
  items,
  selectedItems,
  dragGroup,
  selectionBox,
  selectionDragBox,
  isDragging,
  
  // Search
  searchBoxTarget,
  showSearchBox,
  searchBoxPlacement,
  teleportThreshold,
  searchResults,
  
  // Component map
  componentMap,
  
  // Event handlers
  onDashboardClick,
  handleDashboardPointerDown,
  handleDashboardPointerMove,
  handleDashboardPointerUp,
  updateItemPosition,
  onDragEnd,
  onResize,
  onResizeEnd,
  onItemClick,
  
  // Search handlers
  onSearch,
  handleSearchBoxClose,
  handleSearchBoxEnter,
  onSelectSearchResult,
  
  // Mouse position
  handleMouseMove,
} = useDashboard()
</script>

<style scoped>
.dashboard-container {
  position: relative;
}

.dashboard-wrapper {
  height: 100%;
  display: flex;
  flex-flow: column;
}

.dashboard-container {
  flex: 1;
}
</style> 