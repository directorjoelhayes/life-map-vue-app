<template>
  <div class="calendar-widget">
    <div class="calendar-header">
      <span class="material-symbols-outlined calendar-icon">calendar_month</span>
      <h3 class="calendar-title">Events</h3>
      <div class="calendar-nav">
        <button @click="previousMonth" class="nav-button">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="current-month">{{ currentMonthYear }}</span>
        <button @click="nextMonth" class="nav-button">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>
      <div class="calendar-days">
        <div
          v-for="day in calendarDays"
          :key="`${day.date}-${day.month}`"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-events': day.events.length > 0,
            'selected': day.date === selectedDate
          }"
          @click="selectDate(day)"
        >
          <span class="day-number">{{ day.date }}</span>
          <div v-if="day.events.length > 0" class="event-dots">
            <div
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              class="event-dot"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="events-section">
      <div class="events-header">
        <span>Events for {{ selectedDateFormatted }}</span>
        <button @click="showAddEvent = true" class="add-event-button">
          <span class="material-symbols-outlined">add</span>
        </button>
      </div>
      
      <div class="events-list">
        <div
          v-for="event in selectedDayEvents"
          :key="event.id"
          class="event-item"
        >
          <div class="event-time">{{ event.time }}</div>
          <div class="event-title">{{ event.title }}</div>
          <button @click="deleteEvent(event.id)" class="delete-event">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div v-if="selectedDayEvents.length === 0" class="no-events">
          No events for this day
        </div>
      </div>
    </div>

    <!-- Add Event Modal -->
    <div v-if="showAddEvent" class="modal-overlay" @click="showAddEvent = false">
      <div class="modal" @click.stop>
        <h4>Add Event</h4>
        <input
          ref="eventTitleInput"
          v-model="newEvent.title"
          placeholder="Event title"
          class="event-input"
        />
        <input
          v-model="newEvent.time"
          type="time"
          class="event-input"
        />
        <div class="modal-buttons">
          <button @click="addEvent" class="save-button">Save</button>
          <button @click="showAddEvent = false" class="cancel-button">Cancel</button>
        </div>
      </div>
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

const currentDate = ref(new Date())
const selectedDate = ref(new Date().getDate())
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const events = ref([])
const showAddEvent = ref(false)
const newEvent = ref({ title: '', time: '09:00' })
const eventTitleInput = ref(null)

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const widgetId = `calendar-widget-${Math.random().toString(36).substr(2, 9)}`

// Focus method
const focus = async () => {
  await nextTick()
  // Show add event modal and focus on input
  showAddEvent.value = true
  await nextTick()
  if (eventTitleInput.value) {
    eventTitleInput.value.focus()
  }
}

// Watch for lockContent changes to auto-focus
watch(() => props.lockContent, (newVal) => {
  if (!newVal) {
    focus()
  }
})

// Computed properties
const currentMonthYear = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const selectedDateFormatted = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, selectedDate.value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
})

const calendarDays = computed(() => {
  const firstDay = new Date(selectedYear.value, selectedMonth.value, 1)
  const lastDay = new Date(selectedYear.value, selectedMonth.value + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dayEvents = events.value.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
    
    days.push({
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: date.getMonth() === selectedMonth.value,
      isToday: date.toDateString() === today.toDateString(),
      events: dayEvents
    })
  }
  
  return days
})

const selectedDayEvents = computed(() => {
  const selectedDateObj = new Date(selectedYear.value, selectedMonth.value, selectedDate.value)
  return events.value
    .filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === selectedDateObj.toDateString()
    })
    .sort((a, b) => a.time.localeCompare(b.time))
})

// Methods
const previousMonth = () => {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
}

const nextMonth = () => {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0
    selectedYear.value++
  } else {
    selectedMonth.value++
  }
}

const selectDate = (day) => {
  selectedDate.value = day.date
  selectedMonth.value = day.month
  selectedYear.value = day.year
}

const addEvent = () => {
  if (newEvent.value.title.trim()) {
    const eventDate = new Date(selectedYear.value, selectedMonth.value, selectedDate.value)
    events.value.push({
      id: Date.now(),
      title: newEvent.value.title.trim(),
      time: newEvent.value.time,
      date: eventDate.toISOString(),
      createdAt: new Date().toISOString()
    })
    
    newEvent.value = { title: '', time: '09:00' }
    showAddEvent.value = false
    saveEvents()
  }
}

const deleteEvent = (eventId) => {
  events.value = events.value.filter(event => event.id !== eventId)
  saveEvents()
}

const saveEvents = () => {
  localStorage.setItem(`${widgetId}-events`, JSON.stringify(events.value))
}

const loadEvents = () => {
  const saved = localStorage.getItem(`${widgetId}-events`)
  if (saved) {
    events.value = JSON.parse(saved)
  }
}

onMounted(() => {
  loadEvents()
})

// Expose focus method for parent component
defineExpose({
  focus
})
</script>

<style scoped>
.calendar-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-600);
  border-radius: 10px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-500);
  border-bottom: 1px solid var(--surface-400);
  gap: 8px;
}

.calendar-icon {
  color: var(--primary);
  font-size: 20px;
}

.calendar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.calendar-nav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.nav-button:hover {
  background: var(--surface-400);
  color: var(--text-primary);
}

.current-month {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  text-align: center;
}

.calendar-grid {
  padding: 8px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  position: relative;
  padding: 2px;
}

.calendar-day:hover {
  background: var(--surface-500);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: var(--primary);
  color: white;
}

.calendar-day.selected {
  background: var(--surface-400);
}

.calendar-day.has-events .day-number {
  font-weight: 600;
}

.day-number {
  font-size: 11px;
  color: var(--text-primary);
}

.event-dots {
  display: flex;
  gap: 1px;
  margin-top: 1px;
}

.event-dot {
  width: 3px;
  height: 3px;
  background: var(--primary);
  border-radius: 50%;
}

.calendar-day.today .event-dot {
  background: white;
}

.events-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--surface-400);
}

.events-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--surface-500);
}

.add-event-button {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.add-event-button:hover {
  background: var(--surface-400);
}

.events-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 12px;
  background: var(--surface-500);
  border-radius: 6px;
  margin-bottom: 4px;
}

.event-time {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  min-width: 40px;
}

.event-title {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
}

.delete-event {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.event-item:hover .delete-event {
  opacity: 1;
}

.delete-event:hover {
  background: var(--surface-400);
  color: var(--text-primary);
}

.no-events {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--surface-600);
  border-radius: 8px;
  padding: 20px;
  min-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal h4 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 16px;
}

.event-input {
  width: 100%;
  background: var(--surface-500);
  border: 1px solid var(--surface-400);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 12px;
}

.event-input:focus {
  outline: none;
  border-color: var(--primary);
}

.modal-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.save-button, .cancel-button {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.save-button {
  background: var(--primary);
  color: white;
}

.cancel-button {
  background: var(--surface-500);
  color: var(--text-secondary);
}

.save-button:hover {
  background: var(--primary-400);
}

.cancel-button:hover {
  background: var(--surface-400);
  color: var(--text-primary);
}
</style> 