
<template>
  <div :class="getClass" class="row">
    <div class="checkbox cell">
        <input type="checkbox">
    </div>
    <div v-for="(header, index) in headers" :key="index" class="cell">
      <slot :item="item" :name="columnName(header)">
        <div>
          {{ getNonSlotValue(item, header) }}
        </div>
      </slot>
    </div>
  </div>
</template>
  
  <script setup>
import { computed } from "vue";

// Define props
const props = defineProps({
  itemClass: {
    type: String,
    default: "",
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
    default: true,
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
  console.log(item, "item", header, "header");
  const val = item[header.key];
  return val || "";
};

const toggleSelect = (value) => {
  console.log(props.item, "props.item");
  emit("toggle-select", props.item);
};
</script>
  
  <style scoped>
.row {
  display: contents;
}

.checkbox input {
    opacity: 0;
}

.row:hover .checkbox input {
    opacity: 1;
}
</style>
  
  