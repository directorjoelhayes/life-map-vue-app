<template>
  <div class="search-box-container" ref="searchBoxContainer">
    <div class="search-box-input-container">
      <SearchField
        ref="searchField"
        :modelValue="query"
        @search="handleSearch"
        @enter="handleEnter"
        :loading="loading"
        v-model:statuses="fieldStatuses"
      />
      <kbd v-if="shortCodeMatch">
        <span>{{ shortCodeMatch.shortCode }}</span>
        <div
          class="short-code-match-info"
          @click="handleAction(shortCodeMatch)"
        >
          <div class="image"></div>
          <div class="icon">
            <h2>{{ shortCodeMatch.title }}</h2>
            <p>{{ shortCodeMatch.description }}</p>
          </div>
        </div>
      </kbd>
    </div>
    <div class="search-box-results">
      <div
        class="search-box-result-item"
        v-for="result in resultsWithShortCode"
        :key="result.id"
        :class="{ active: selectedResult === result }"
        @click="handleSelectResult(result)"
      >
        <div class="search-box-result-item-icon">
          <span v-if="!result.icon" class="material-symbols-outlined"
            >token</span
          >
          <span v-else class="material-symbols-outlined">{{
            result.icon
          }}</span>
        </div>
        <div class="search-box-result-item-name">
          <h3>{{ result.title }}</h3>
          <p v-if="result.description">{{ result.description }}</p>
        </div>
      </div>
      <div
        v-if="resultsWithShortCode.length === 0"
        class="search-box-result-item"
      >
        <div class="search-box-result-item-icon">
          <span class="material-symbols-outlined">search</span>
        </div>
        <div class="search-box-result-item-name">
          <h3>No results found</h3>
          <p>Try a different search</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted } from "vue";
import SearchField from "/src/ui/fields/search/search-field.vue";

const searchBoxContainer = ref(null);
const searchField = ref(null);
const query = ref("");
const fieldStatuses = ref([]);

const resultsWithShortCode = computed(() => {
  if (props.shortCodeMatch) {
    return [
      props.shortCodeMatch,
      ...props.results.filter(
        (result) => result.shortCode !== props.shortCodeMatch.shortCode
      ),
    ];
  }
  return props.results;
});

const props = defineProps({
  actionEventSource: {
    type: Object,
    default: null,
  },
  results: {
    type: Array,
    required: true,
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  targetElement: {
    type: Object,
    default: null,
  },
  show: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: "bottom-center", // bottom-center, bottom-left, bottom-right, top-center, etc.
  },
  teleportThreshold: {
    type: Number,
    default: 150, // pixels - distance threshold for instant teleportation
  },
  shortCodeMatch: {
    type: Object,
    default: null,
  },
});

const loading = ref(false);

const emit = defineEmits(["search", "close", "select", "enter"]);

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

watch(
  () => props.actionEventSource,
  (newActionEventSource) => {
    if (newActionEventSource) {
      loading.value = true;
      newActionEventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log({
          type: data.type,
          message: data.message,
        });
        fieldStatuses.value.splice(0, fieldStatuses.value.length, {
          type: data.type,
          message: data.message,
        });
        if (data.status === "completed") {
          loading.value = false;
          fieldStatuses.value.splice(0, fieldStatuses.value.length, {
            type: data.type,
            message: data.message,
          });
          setTimeout(() => {
            fieldStatuses.value.splice(0, fieldStatuses.value.length);
          }, 1400);
        }
      };
    } else {
      loading.value = false;
    }
  }
);

onMounted(async () => {
  await focus();
});

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
  if (props.shortCodeMatch) {
    return props.shortCodeMatch;
  }
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
  console.log(selectedResult.value, "selectedResult");
  emit("enter", selectedResult.value);
};
</script>

<style scoped>
.search-box-container {
  width: 600px;
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
.search-box-result-item-icon {
  width: 50px;
  height: 50px;
  background-color: var(--surface-500);
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-box-result-item-name h3 {
  margin: 0px;
}

.search-box-result-item-name p {
  margin: 0px;
  color: var(--surface-200);
  font-size: 90%;
}

.short-code-match-info {
  position: absolute;
  font-size: 20px;
  left: 50px;
  bottom: 50px;
  min-width: 200px;
  display: flex;
}

.short-code-match-info h2 {
  font-size: 20px;
  font-weight: 100;
  border-bottom-style: solid;
  border-width: 1px;
}

.short-code-match-info::after {
  content: "";
  position: absolute;
  bottom: 9.5px;
  left: -25.5px;
  transform: rotate(-45deg);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  height: 0px;
  width: 30px;
}
kbd {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-style: solid;
  min-width: 30px;
  border-radius: 4px;
  border-width: 1px;
  color: var(--primary-400);
  right: 40px;
  top: 50%;
  transform: translateY(calc(-50% - 5px));
}
.search-field-wrapper {
  position: relative;
}
.search-box-input-container {
  position: relative;
}
.short-code-match-info h2 {
  margin: 0px;
}
.short-code-match-info p {
  opacity: 0.8;
  font-size: 80%;
  margin: 0px;
}
</style>

