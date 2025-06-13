<template>
  <div class="note-widget" >
    <div class="note-header" v-show="!lockContent">
      <span class="material-symbols-outlined note-icon">note</span>
      <h3 class="note-title">Note</h3>
    </div>
    <div class="note-content">
      <textarea
        ref="noteTextarea"
        v-model="noteContent"
        placeholder="Start typing your notes..."
        class="note-textarea"
        @input="saveNote"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  lockContent: {
    type: Boolean,
    default: false
  }
})

const noteContent = ref('')
const noteTextarea = ref(null)

// Auto-save functionality
const saveNote = () => {
  localStorage.setItem('note-widget-content', noteContent.value)
}

// Focus method
const focus = async () => {
  await nextTick()
  if (noteTextarea.value) {
    noteTextarea.value.focus()
    // Move cursor to end of text
    const length = noteTextarea.value.value.length
    noteTextarea.value.setSelectionRange(length, length)
  }
}

// Watch for lockContent changes to auto-focus
watch(() => props.lockContent, (newVal) => {
  console.log(newVal, "newVal");
  if (!newVal) {
    focus()
  }
})

// Load saved content on mount
onMounted(() => {
  const saved = localStorage.getItem('note-widget-content')
  if (saved) {
    noteContent.value = saved
  }
})

// Expose focus method for parent component
defineExpose({
  focus
})
</script>

<style scoped>
.note-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-500);
  border-radius: 10px;
  overflow: hidden;
}

.note-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-500);
  border-bottom: 1px solid var(--surface-400);
  gap: 8px;
}

.note-icon {
  color: var(--primary);
  font-size: 20px;
}

.note-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.note-content {
  flex: 1;
  padding: 16px;
}

.note-textarea {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.note-textarea::placeholder {
  color: var(--text-secondary);
}

.note-textarea:focus {
  outline: none;
}
</style> 