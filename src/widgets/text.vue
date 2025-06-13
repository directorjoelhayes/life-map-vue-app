<template>
  <div class="text-widget">
    <div class="text-toolbar" v-show="!lockContent">
      <button @click="formatText('bold')" :class="{ active: isFormatActive('bold') }">
        <span class="material-symbols-outlined">format_bold</span>
      </button>
      <button @click="formatText('italic')" :class="{ active: isFormatActive('italic') }">
        <span class="material-symbols-outlined">format_italic</span>
      </button>
      <button @click="formatText('underline')" :class="{ active: isFormatActive('underline') }">
        <span class="material-symbols-outlined">format_underlined</span>
      </button>
      <div class="toolbar-separator"></div>
      <button @click="clearFormatting">
        <span class="material-symbols-outlined">format_clear</span>
      </button>
    </div>
    <div
      ref="textEditor"
      class="text-editor"
      contenteditable="true"
      @input="saveContent"
      @keydown="handleKeyDown"
      placeholder="Start typing..."
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

// Props
const props = defineProps({
  lockContent: {
    type: Boolean,
    default: false
  }
})

const textEditor = ref(null)
const widgetId = `text-widget-${Math.random().toString(36).substr(2, 9)}`

// Format text commands
const formatText = (command) => {
  document.execCommand(command, false, null)
  textEditor.value.focus()
  saveContent()
}

// Check if format is currently active
const isFormatActive = (command) => {
  return document.queryCommandState(command)
}

// Clear all formatting
const clearFormatting = () => {
  document.execCommand('removeFormat', false, null)
  textEditor.value.focus()
  saveContent()
}

// Focus method
const focus = async () => {
  await nextTick()
  if (textEditor.value) {
    textEditor.value.focus()
    // Move cursor to end of content
    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(textEditor.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

// Watch for lockContent changes to auto-focus
watch(() => props.lockContent, (newVal) => {
  if (!newVal) {
    focus()
  }
})

// Handle keyboard shortcuts
const handleKeyDown = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        formatText('bold')
        break
      case 'i':
        event.preventDefault()
        formatText('italic')
        break
      case 'u':
        event.preventDefault()
        formatText('underline')
        break
    }
  }
}

// Auto-save functionality
const saveContent = () => {
  if (textEditor.value) {
    localStorage.setItem(`${widgetId}-content`, textEditor.value.innerHTML)
  }
}

// Load saved content on mount
onMounted(async () => {
  await nextTick()
  const saved = localStorage.getItem(`${widgetId}-content`)
  if (saved && textEditor.value) {
    textEditor.value.innerHTML = saved
  }
})

// Expose focus method for parent component
defineExpose({
  focus
})
</script>

<style scoped>
.text-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-500);
  border-radius: 10px;
  overflow: hidden;
}

.text-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--surface-500);
  border-bottom: 1px solid var(--surface-400);
  gap: 4px;
}

.text-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.text-toolbar button:hover {
  background: var(--surface-400);
  color: var(--text-primary);
}

.text-toolbar button.active {
  background: var(--primary);
  color: white;
}

.text-toolbar .material-symbols-outlined {
  font-size: 18px;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--surface-400);
  margin: 0 8px;
}

.text-editor {
  flex: 1;
  padding: 16px;
  color: var(--text-primary);
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
}

.text-editor:empty:before {
  content: attr(placeholder);
  color: var(--text-secondary);
  pointer-events: none;
}

.text-editor p {
  margin: 0 0 12px 0;
}

.text-editor p:last-child {
  margin-bottom: 0;
}
</style> 