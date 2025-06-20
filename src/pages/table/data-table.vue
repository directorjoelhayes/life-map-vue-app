<template>
  <div class="table" :style="tableGridStyle">
    <div class="header">
      <div class="checkbox cell" v-if="selectable">
        
      </div>
      <div
        v-for="(header, index) in headers"
        :key="'header-' + index"
        class="cell"
      >
        {{ header.name }}
      </div>
    </div>
    <RowHandler
      v-for="(row, rowIndex) in rows"
      :key="'row-' + rowIndex"
      :item="row"
      :headers="headers"
    >
      <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
        <slot :name="slotName" v-bind="slotData"></slot>
      </template>
    </RowHandler>
  </div>

  <!-- <data-table-row-handler
        :item="row"
        :headers="headers"
        :item-class="getClass(row)"
        v-on:toggle-select="handleToggleSelect($event)"
        :is-selected="isSelected(element)"
      >
        <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
          <slot :name="slotName" v-bind="slotData"></slot>
        </template>
      </data-table-row-handler> -->
</template>
  
<script setup>
import { computed } from "vue";
import RowHandler from "./row-handler.vue";

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  selectable: {
    type: Boolean,
    default: true,
  },
});

function randomDataTest(col) {
  return Array.from({ length: 4 }, (_, index) => ({
    price: Math.random() * Math.random() * 100,
  })).reduce((acc, curr) => {
    acc += curr.price;
    return acc;
  }, 0);

  return Math.round(acc / 1000);
}

// Dynamically generate grid column count
const tableGridStyle = computed(() => {
  if (props.selectable) {
    return {
      gridTemplateColumns: ["40px", ...props.headers.map(() => "1fr")].join(" ")
    }
  }
  return {
    gridTemplateColumns: `repeat(${props.headers.length}, 1fr)`
  }
})
</script>
  
  <style scoped>
.table {
  display: grid;
  /* border: 1px solid #ccc; */
  border-radius: 6px;
  font-family: sans-serif;
}

.header,
.row {
  display: contents;
}

:deep(.cell) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--surface-900);
  background: var(--surface-500);
}

.header .cell {
  background: var(--surface-500);
  font-weight: bold;
  border-bottom: 2px solid var(--surface-700);
}

:deep(.row:hover .cell) {
  background: var(--surface);
  cursor: pointer;
}

/* Responsive stacking */
@media (max-width: 600px) {
  .table {
    display: block;
  }

  .row,
  .header {
    display: block;
  }

  .cell {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }

  .header {
    display: none;
  }

  .cell::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: #444;
  }
}
</style>
  