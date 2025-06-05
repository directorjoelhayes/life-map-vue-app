<template>
  <div
    class="search-box-container"
    ref="searchBoxContainer"
    :style="positionStyle"
    v-show="show"
    @toggle="handleToggle"
  >
    <div class="search-box-input-container">
      <SearchField
        ref="searchField"
        :modelValue="query"
        @search="handleSearch"
        @enter="handleEnter"
      />
    </div>
    <div class="search-box-results">
      <div
        class="search-box-result-item"
        v-for="result in results"
        :key="result.id"
        :class="{ 'active': selectedResult === result }"
        @click="handleSelectResult(result)"
      >
        <div class="search-box-result-item-icon">
          <span class="material-symbols-outlined">{{ result.icon }}</span>
        </div>
        <div class="search-box-result-item-name">
          {{ result.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";
import SearchField from "/src/ui/fields/search/search-field.vue";

const searchBoxContainer = ref(null);
const searchField = ref(null);
const query = ref("");
const previousPosition = ref({ x: 0, y: 0 });

const props = defineProps({
  results: {
    type: Array,
    required: true,
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  targetElement: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: 'bottom-center', // bottom-center, bottom-left, bottom-right, top-center, etc.
  },
  teleportThreshold: {
    type: Number,
    default: 150 // pixels - distance threshold for instant teleportation
  }
});

const emit = defineEmits(["search", "close", "select"]);

// Calculate position based on target element and placement preference
const calculatePosition = () => {
  if (!props.targetElement) {
    return { x: props.position.x, y: props.position.y };
  }

  const target = props.targetElement;
  const popoverWidth = 400; // SearchBox width
  const popoverHeight = 300; // Estimated height
  const margin = 10;

  let x, y;

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate base position based on placement
  switch (props.placement) {
    case 'bottom-center':
      x = target.x + (target.width / 2) - (popoverWidth / 2);
      y = target.y + target.height + margin;
      break;
    case 'bottom-left':
      x = target.x;
      y = target.y + target.height + margin;
      break;
    case 'bottom-right':
      x = target.x + target.width - popoverWidth;
      y = target.y + target.height + margin;
      break;
    case 'top-center':
      x = target.x + (target.width / 2) - (popoverWidth / 2);
      y = target.y - popoverHeight - margin;
      break;
    case 'right-center':
      x = target.x + target.width + margin;
      y = target.y + (target.height / 2) - (popoverHeight / 2);
      break;
    case 'left-center':
      x = target.x - popoverWidth - margin;
      y = target.y + (target.height / 2) - (popoverHeight / 2);
      break;
    default:
      x = target.x;
      y = target.y + target.height + margin;
  }

  // Adjust for viewport boundaries
  if (x + popoverWidth > viewportWidth) {
    x = viewportWidth - popoverWidth - margin;
  }
  if (x < margin) {
    x = margin;
  }
  if (y + popoverHeight > viewportHeight) {
    y = target.y - popoverHeight - margin; // Flip to top
  }
  if (y < margin) {
    y = target.y + target.height + margin; // Flip to bottom
  }

  return { x, y };
};

// Calculate distance between two points
const calculateDistance = (pos1, pos2) => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Computed style for positioning with smart transitions
const positionStyle = computed(() => {
  const pos = calculatePosition();
  const distance = calculateDistance(previousPosition.value, pos);
  console.log(distance, "distance", props.teleportThreshold);

  const shouldTeleport = distance > props.teleportThreshold;
  
  // Debug logging for development
  if (import.meta.env.DEV && distance > 0) {
    console.log(`SearchBox move: ${Math.round(distance)}px ${shouldTeleport ? '⚡ TELEPORT' : '🏃 SMOOTH'} (threshold: ${props.teleportThreshold}px)`);
  }
  
  // Update previous position for next calculation
  previousPosition.value = { ...pos };
  
  return {
    position: 'fixed',
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    zIndex: 999999,
    transition: shouldTeleport ? 'none' : 'left 0.1s ease-out, top 0.1s ease-out'
  };
});

// Initialize previous position when search box becomes visible
watch(() => props.show, (newShow) => {
  if (newShow) {
    // Reset previous position to avoid large initial jump
    const pos = calculatePosition();
    previousPosition.value = { ...pos };
  }
});

// Focus method to be called from parent
const focus = async () => {
  await nextTick();
  if (searchField.value && searchField.value.$el) {
    const input = searchField.value.$el.querySelector("input");
    if (input) {
      input.focus();
    }
  }
};

// Show/hide popover based on show prop
watch(
  () => props.show,
  async (newShow) => {
    if (searchBoxContainer.value) {
      if (newShow) {
        await focus();
      } else {
        // searchBoxContainer.value.hidePopover();
      }
    }
  }
);

// Replace the watch with a computed property
const selectedResult = computed(() => {
  return props.results.length > 0 ? props.results[0] : null;
});

// Handle popover toggle events (when user clicks outside, etc.)
const handleToggle = (event) => {
  if (event.newState === "closed") {
    emit("close");
    // Clear the search query when popover closes
    query.value = "";
  }
};

// Handle result selection and close popover
const handleSelectResult = (result) => {
  emit("select", result);
  // Popover will close automatically, which will trigger handleToggle
};

// Expose methods to parent
defineExpose({
  focus,
  showPopover: () => searchBoxContainer.value?.showPopover(),
  hidePopover: () => searchBoxContainer.value?.hidePopover(),
});

const handleSearch = (searchQuery) => {
  console.log(searchQuery, "search in SearchBox");
  emit("search", searchQuery);
};

const handleEnter = () => {
  emit("enter", selectedResult.value);
};
</script>

<style scoped>
.search-box-container {
  width: 400px;
  background: #ffffff0d;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-300);
  padding: 0;
  margin: 0;
}

/* Reset default popover styles */
.search-box-container::backdrop {
  background: transparent;
}

.search-box-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-box-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--surface-400);
  transition: background-color 0.2s ease;
}

.search-box-result-item:last-child {
  border-bottom: none;
}

.search-box-result-item:hover, 
.search-box-result-item.active {
  background-color: var(--surface-400);
  cursor: pointer;
  color: var(--primary);
}

.search-box-result-item-icon {
  margin-right: 10px;
  min-width: 24px;
  display: flex;
  align-items: center;
}

.search-box-result-item-name {
  flex: 1;
}
</style>

