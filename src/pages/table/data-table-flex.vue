<template>
  <div class="flex-table">
    <div ref="sentinelRef" class="sticky-sentinel"></div>
    <div class="table-row header" ref="headerRef">
      <div class="checkbox cell" v-if="selectable">
        <UiCheckbox />
      </div>
      <div
        v-for="(header, i) in headers"
        :key="'header-' + i"
        class="cell"
        @click="sortByHeader(header)"
        :style="{ flex: columnWidths[i] || '1' }"
      >
        <div>
          {{ header.name }}
          <span v-if="sortState.key === header.key">
            <template v-if="sortState.direction === 'asc'">▲</template>
            <template v-else-if="sortState.direction === 'desc'">▼</template>
          </span>
        </div>
      </div>
    </div>
    <!-- Table Rows -->
    <div
      v-for="chunk in chunks"
      :key="chunk.index"
      :ref="setChunkRef"
      :data-chunk-index="chunk.index"
      class="chunk"
      :style="{
        height:
          rowHeight * chunk.rows.length + 0.667 * chunk.rows.length + 'px',
      }"
    >
      <template v-if="visibleChunks.has(chunk.index)">
        <div
          v-for="(row, rowIndex) in chunk.rows"
          :key="row[idKey]"
          :data-id="row[idKey]"
          :data-index="chunk.index + '-' + rowIndex"
          class="table-row"
          :style="{ height: rowHeight + 'px' }"
        >
          <RowHandler
            :item="row"
            :headers="headers"
            :column-widths="columnWidths"
            :selectable="selectable"
          >
            <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
              <slot :name="slotName" v-bind="slotData" />
            </template>
          </RowHandler>
        </div>
      </template>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, nextTick, reactive, watch } from "vue";
import RowHandler from "./row-handler.vue";
import UiCheckbox from "/src/ui/checkbox/checkbox.vue";

const props = defineProps({
  headers: Array,
  rows: Array,
  selectable: {
    type: Boolean,
    default: false,
  },
  columnWidths: {
    type: Array,
    default: () => [],
  },
  idKey: {
    type: String,
    default: "id",
  },
  chunkSize: {
    type: Number,
    default: 20,
  },
  rowHeight: {
    type: Number,
    default: 48,
  },
});

// Virtual dataset - the source of truth
const virtualRows = ref([...props.rows]);
// Chunk mapping - tracks which virtual indices map to which chunk positions
const chunkMapping = ref([]);
const visibleChunks = ref(new Map());
const chunks = ref([]);
const refElements = new Map();
const defaultMapping = ref([]);
const isShuffled = ref(false);
const headerRef = ref(null);
const sentinelRef = ref(null);

const sortState = ref({
  key: null, // which column is sorted
  direction: null, // 'asc' | 'desc' | null
});

const sortableHeaders = reactive(
  props.headers.map((header) => ({
    ...header,
    isSorted: false,
    sortDirection: "asc",
  }))
);

let lastRowsLength = props.rows.length;

// Initialize chunk mapping
function initializeChunkMapping() {
  chunkMapping.value = [];
  defaultMapping.value = [];
  for (let i = 0; i < virtualRows.value.length; i++) {
    chunkMapping.value.push(i);
    defaultMapping.value.push(i);
  }
}

const setChunkRef = (el) => {
  if (el && el.dataset && el.dataset.chunkIndex !== undefined) {
    const chunkIndex = parseInt(el.dataset.chunkIndex);
    refElements.set(chunkIndex, el);
  }
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const chunkIndex = parseInt(entry.target.dataset.chunkIndex);
    if (entry.isIntersecting) {
      visibleChunks.value.set(chunkIndex, true);
      // Apply virtual data to this chunk when it becomes visible
      applyVirtualDataToChunk(chunkIndex);
    } else {
      visibleChunks.value.delete(chunkIndex);
    }
  });
});

function observeAll() {
  observer.disconnect();
  nextTick(() => {
    refElements.forEach((el) => observer.observe(el));
  });
}

function createChunks() {
  chunks.value = [];
  for (let i = 0; i < virtualRows.value.length; i += props.chunkSize) {
    const chunkIndex = Math.floor(i / props.chunkSize);
    const chunkRows = [];

    // Create chunk with mapped virtual data
    for (let j = 0; j < props.chunkSize; j++) {
      const virtualIndex = i + j;
      if (virtualIndex < virtualRows.value.length) {
        const mappedVirtualIndex = chunkMapping.value[virtualIndex];
        chunkRows.push({
          ...virtualRows.value[mappedVirtualIndex],
          _virtualIndex: mappedVirtualIndex, // Track the virtual index for updates
          _chunkPosition: virtualIndex, // Track the chunk position
        });
      }
    }

    chunks.value.push({
      index: chunkIndex,
      rows: chunkRows,
    });
  }
}

// Apply virtual data to a specific chunk using mapping
function applyVirtualDataToChunk(chunkIndex) {
  const chunk = chunks.value.find((chunk) => chunk.index === chunkIndex);
  if (!chunk) return;

  const startIndex = chunkIndex * props.chunkSize;

  chunk.rows.forEach((row, localIndex) => {
    const virtualIndex = startIndex + localIndex;
    if (virtualIndex < chunkMapping.value.length) {
      const mappedVirtualIndex = chunkMapping.value[virtualIndex];
      if (mappedVirtualIndex < virtualRows.value.length) {
        Object.assign(row, virtualRows.value[mappedVirtualIndex]);
        row._virtualIndex = mappedVirtualIndex;
      }
    }
  });
}

function sortByHeader(header) {
  if (sortState.value.key !== header.key) {
    // New header: sort ascending from original order
    sortState.value.key = header.key;
    sortState.value.direction = "asc";
    applySort();
  } else if (sortState.value.direction === "asc") {
    // Toggle to descending
    sortState.value.direction = "desc";
    applySort();
  } else if (sortState.value.direction === "desc") {
    // Toggle off
    sortState.value.key = null;
    sortState.value.direction = null;
    // Restore original order
    chunkMapping.value = [...defaultMapping.value];
    isShuffled.value = false;
    updateVisibleChunks();
  } else {
    // Should not happen, but fallback to ascending
    sortState.value.direction = "asc";
    applySort();
  }
}

function applySort() {
  if (!sortState.value.key || !sortState.value.direction) return;

  // Find the header for the current sort key
  const header = props.headers.find((h) => h.key === sortState.value.key);

  // Always sort from the original order
  const sorted = [...defaultMapping.value].sort((aIdx, bIdx) => {
    const aRow = virtualRows.value[aIdx];
    const bRow = virtualRows.value[bIdx];
    const a = aRow[sortState.value.key];
    const b = bRow[sortState.value.key];

    let result = 0;
    if (header) {
      if (typeof header.rawSort === "function") {
        result = header.rawSort(aRow, bRow);
      } else if (typeof header.sort === "function") {
        result = header.sort(a, b);
      } else {
        // Default comparison
        if (a == null && b == null) result = 0;
        else if (a == null) result = -1;
        else if (b == null) result = 1;
        else if (a === b) result = 0;
        else result = a > b ? 1 : -1;
      }
    }

    return sortState.value.direction === "asc" ? result : -result;
  });

  chunkMapping.value = sorted;
  isShuffled.value = true;
  updateVisibleChunks();
}

function updateVisibleChunks() {
  visibleChunks.value.forEach((isVisible, chunkIndex) => {
    if (isVisible) {
      applyVirtualDataToChunk(chunkIndex);
    }
  });
}

function toggleOrder() {
  if (isShuffled.value) {
    // Restore original order
    chunkMapping.value = [...defaultMapping.value];
    isShuffled.value = false;
  } else {
    // Shuffle
    const shuffled = [...chunkMapping.value];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    chunkMapping.value = shuffled;
    isShuffled.value = true;
  }
  // Update visible chunks
  visibleChunks.value.forEach((isVisible, chunkIndex) => {
    if (isVisible) {
      applyVirtualDataToChunk(chunkIndex);
    }
  });
}

// Update rows using the mapping
function updateRows(updates) {
  // 1. Build a map: virtualIndex -> [chunkPosition, ...]
  const virtualToChunkPositions = new Map();
  chunkMapping.value.forEach((mappedIndex, chunkPosition) => {
    if (!virtualToChunkPositions.has(mappedIndex)) {
      virtualToChunkPositions.set(mappedIndex, []);
    }
    virtualToChunkPositions.get(mappedIndex).push(chunkPosition);
  });

  // 2. For each update, update virtualRows and all visible chunk rows
  updates.forEach(([rowId, newData]) => {
    // Find the virtual index of the row to update
    const virtualIndex = virtualRows.value.findIndex(
      (row) => row[props.idKey] === rowId
    );
    if (virtualIndex === -1) return;

    // Update the virtual data
    Object.assign(virtualRows.value[virtualIndex], newData);

    // Get all chunk positions that map to this virtual index
    const chunkPositions = virtualToChunkPositions.get(virtualIndex);
    if (!chunkPositions) return;

    chunkPositions.forEach((chunkPosition) => {
      const chunkIndex = Math.floor(chunkPosition / props.chunkSize);
      const chunk = chunks.value.find((chunk) => chunk.index === chunkIndex);
      if (chunk) {
        const localIndex = chunkPosition % props.chunkSize;
        const row = chunk.rows[localIndex];
        if (row && row._virtualIndex === virtualIndex) {
          Object.assign(row, newData);
        }
      }
    });
  });
}

defineExpose({
  updateRows,
  toggleOrder,
});

// Watch for changes in props.rows from parent component
watch(
  () => props.rows,
  (newRows) => {
    // If the number of rows changed, reset mapping and chunks
    if (newRows.length !== lastRowsLength) {
      virtualRows.value = [...newRows];
      initializeChunkMapping();
      createChunks();
      lastRowsLength = newRows.length;
    } else {
      // Only update the data in place, keep mapping
      newRows.forEach((newRow, i) => {
        Object.assign(virtualRows.value[i], newRow);
      });
    }

    nextTick(() => {
      visibleChunks.value.forEach((isVisible, chunkIndex) => {
        if (isVisible) {
          applyVirtualDataToChunk(chunkIndex);
        }
      });
    });
  },
  { deep: true }
);

onMounted(() => {
  initializeChunkMapping();
  createChunks();
  nextTick(() => {
    observeAll();
  });

  const header = headerRef.value;
  const sentinel = sentinelRef.value;

  if (!header || !sentinel) return; // Defensive: only proceed if both exist

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("stuck", entry.intersectionRatio === 0);
    },
    {
      threshold: [0],
      root: null,
    }
  );
  observer.observe(sentinel);
});

watch(virtualRows, () => {
  createChunks();
  nextTick(() => {
    observeAll();
  });
});
</script>
  
<style scoped>
.flex-table {
  display: flex;
  flex-direction: column;
  font-family: sans-serif;
  border: 1px solid var(--background);
  border-radius: 6px;
}

.table-row {
  display: flex;
  flex-wrap: nowrap;
  border-bottom: 1px solid var(--background-400);
}

.table-row:last-child {
  border-bottom: none;
}

.checkbox.cell,
.header .cell.checkbox {
  padding: 0.75rem 0.5rem;
}

:deep(.cell) {
  padding: 0.75rem 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: var(--background);
}

.chunk {
  border-bottom: 1px solid var(--background-400);
}

.header .cell {
  background-color: var(--background);
  font-weight: bold;
  border-bottom: 2px solid var(--background);
  cursor: pointer;
  user-select: none;
  padding: 0px;
}

.header .cell > div {
  padding: 0.75rem 1rem;
}

.table-row.header {
  position: sticky;
  top: -20px;
  z-index: 2;
  background: var(--background);
  
}

.table-body-scroll {
  overflow-y: auto;
  max-height: 500px;
}

/* Responsive: Collapse into stacked mobile format */
@media (max-width: 600px) {
  .table-row {
    flex-direction: column;
    border-bottom: 1px solid var(--background);
  }

  .header {
    display: none;
  }

  .cell {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }

  .cell::before {
    content: attr(data-label);
    font-weight: bold;
    color: #666;
    margin-right: 1rem;
  }
}

.table-row.header.stuck {
  box-shadow: 0 2px 10px var(--background-700);
  /* Add any other sticky styles you want */
  background: var(--background);
  z-index: 10;
}

.sticky-sentinel {
  height: 1px;
  width: 100%;
  pointer-events: none;
}
</style>