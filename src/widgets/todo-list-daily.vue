<template>
  <div class="todo-widget">
    <div class="todo-header">
      <span class="material-symbols-outlined todo-icon">list_alt_check</span>
      <h3 class="todo-title">Daily Tasks</h3>
      <div class="todo-stats">{{ completedCount }}/{{ todos.length }}</div>
    </div>
    
    <div class="todo-add">
      <input
        ref="todoInput"
        v-model="newTodo"
        @keydown.enter="addTodo"
        placeholder="Add a task..."
        class="todo-input"
      />
      <button @click="addTodo" class="add-button">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>

    <div class="todo-list">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="todo-item"
        :class="{ completed: todo.completed }"
      >
        <button @click="toggleTodo(todo.id)" class="todo-checkbox">
          <span class="material-symbols-outlined">
            {{ todo.completed ? 'check_box' : 'check_box_outline_blank' }}
          </span>
        </button>
        <span class="todo-text">{{ todo.text }}</span>
        <button @click="deleteTodo(todo.id)" class="delete-button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>

    <div class="todo-footer" v-if="todos.length > 0">
      <button @click="clearCompleted" class="clear-button">
        Clear Completed
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  lockContent: {
    type: Boolean,
    default: false
  }
})

const todos = ref([])
const newTodo = ref('')
const todoInput = ref(null)
const widgetId = `todo-daily-${Math.random().toString(36).substr(2, 9)}`

// Computed properties
const completedCount = computed(() => 
  todos.value.filter(todo => todo.completed).length
)

// Focus method
const focus = async () => {
  await nextTick()
  if (todoInput.value) {
    todoInput.value.focus()
  }
}

// Watch for lockContent changes to auto-focus
watch(() => props.lockContent, (newVal) => {
  if (newVal) {
    focus()
  }
})

// Add new todo
const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    })
    newTodo.value = ''
    saveTodos()
  }
}

// Toggle todo completion
const toggleTodo = (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos()
  }
}

// Delete todo
const deleteTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id)
  saveTodos()
}

// Clear completed todos
const clearCompleted = () => {
  todos.value = todos.value.filter(t => !t.completed)
  saveTodos()
}

// Save to localStorage
const saveTodos = () => {
  localStorage.setItem(`${widgetId}-todos`, JSON.stringify(todos.value))
}

// Load from localStorage
const loadTodos = () => {
  const saved = localStorage.getItem(`${widgetId}-todos`)
  if (saved) {
    todos.value = JSON.parse(saved)
  }
}

onMounted(() => {
  loadTodos()
})

// Expose focus method for parent component
defineExpose({
  focus
})
</script>

<style scoped>
.todo-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-600);
  border-radius: 10px;
  overflow: hidden;
}

.todo-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-500);
  border-bottom: 1px solid var(--surface-400);
  gap: 8px;
}

.todo-icon {
  color: var(--primary);
  font-size: 20px;
}

.todo-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.todo-stats {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface-400);
  padding: 4px 8px;
  border-radius: 12px;
}

.todo-add {
  display: flex;
  padding: 12px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--surface-400);
}

.todo-input {
  flex: 1;
  background: var(--surface-500);
  border: 1px solid var(--surface-400);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 14px;
}

.todo-input:focus {
  outline: none;
  border-color: var(--primary);
}

.add-button {
  background: var(--primary);
  border: none;
  border-radius: 6px;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-button:hover {
  background: var(--primary-400);
}

.todo-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 12px;
  transition: background-color 0.2s ease;
}

.todo-item:hover {
  background: var(--surface-500);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-checkbox {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}

.todo-text {
  flex: 1;
  color: var(--text-primary);
  font-size: 14px;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.delete-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.todo-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: var(--surface-400);
  color: var(--text-primary);
}

.todo-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--surface-400);
}

.clear-button {
  background: var(--surface-500);
  border: 1px solid var(--surface-400);
  border-radius: 6px;
  padding: 6px 12px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.clear-button:hover {
  background: var(--surface-400);
  color: var(--text-primary);
}
</style> 