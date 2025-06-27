
<template>
  <div :class="getClass" class="row">
    <div
      class="checkbox cell"
      :class="{ checked: isSelected }"
      v-if="selectable"
    >
      <UiCheckbox
        class="checkbox-input"
        :id="item.id"
        :model-value="isSelected"
        @update:model-value="toggleSelect"
      />
    </div>
    <div
      v-for="(header, index) in headers"
      :key="index"
      class="cell"
      :style="{ flex: columnWidths[index] || '1' }"
    >
      <slot :item="item" :name="columnName(header)">
        <div>
          {{ getNonSlotValue(item, header) }}
        </div>
      </slot>
    </div>
  </div>
</template>
  
<script setup>
import { computed, ref } from "vue";
import UiCheckbox from "/src/ui/checkbox/checkbox.vue";

const isSelected = ref(false);

// Define props
const props = defineProps({
  itemClass: {
    type: String,
    default: "",
  },
  columnWidths: {
    type: Array,
    default: () => [],
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  headers: {
    type: Array,
    default: () => [],
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  key: {
    type: String,
    default: "",
  },
});

// Define emits
const emit = defineEmits(["toggle-select", "select"]);

// Computed
const getClass = computed(() => props.itemClass);

// Methods
const columnName = (header) => header.key;

const getNonSlotValue = (item, header) => {
  const val = item[header.key];
  return val || "";
};

const toggleSelect = (value) => {
  isSelected.value = value;
  console.log(props.item, "props.item");
  emit("toggle-select", props.item);
};
</script>
  
<style scoped>
.row {
  display: contents;
}

:deep(.checkbox-container) {
  opacity: 0;
}

.checkbox.cell {
  padding: 0.75rem 0.5rem;
}

.row:hover :deep(.checkbox-container) {
  opacity: 1;
}
.checkbox.cell.checked :deep(.checkbox-container) {
  opacity: 1;
}
</style>
  
  