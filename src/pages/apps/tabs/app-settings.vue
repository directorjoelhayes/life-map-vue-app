<template>
  <div class="app-settings">
    <Row :gap="'1.5rem'">
      <Col :xs="12" :md="6">
        <LmCard>
          <template #header>
            <div class="settings-header">
              <span class="material-symbols-outlined">settings</span>
              <h3>App Configuration</h3>
            </div>
          </template>
          <template #body>
            <div class="settings-form">
              <div class="form-group">
                <label for="app-name">App Name</label>
                <input 
                  id="app-name" 
                  v-model="localSettings.name" 
                  type="text" 
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="app-description">Description</label>
                <textarea 
                  id="app-description" 
                  v-model="localSettings.description" 
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>Auto-start</label>
                <div class="toggle-switch">
                  <input 
                    id="auto-start" 
                    v-model="localSettings.autoStart" 
                    type="checkbox" 
                    class="toggle-input"
                  />
                  <label for="auto-start" class="toggle-label">
                    <span class="toggle-button"></span>
                  </label>
                  <span class="toggle-text">Start app automatically</span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Notifications</label>
                <div class="toggle-switch">
                  <input 
                    id="notifications" 
                    v-model="localSettings.notifications" 
                    type="checkbox" 
                    class="toggle-input"
                  />
                  <label for="notifications" class="toggle-label">
                    <span class="toggle-button"></span>
                  </label>
                  <span class="toggle-text">Enable notifications</span>
                </div>
              </div>
            </div>
          </template>
        </LmCard>
      </Col>
      
      <Col :xs="12" :md="6">
        <LmCard>
          <template #header>
            <div class="settings-header">
              <span class="material-symbols-outlined">security</span>
              <h3>Security & Permissions</h3>
            </div>
          </template>
          <template #body>
            <div class="permissions-list">
              <div 
                v-for="permission in permissions" 
                :key="permission.name"
                class="permission-item"
              >
                <div class="permission-info">
                  <span class="material-symbols-outlined">{{ permission.icon }}</span>
                  <div>
                    <h4>{{ permission.name }}</h4>
                    <p>{{ permission.description }}</p>
                  </div>
                </div>
                <div class="toggle-switch">
                  <input 
                    :id="permission.key" 
                    v-model="localSettings.permissions[permission.key]" 
                    type="checkbox" 
                    class="toggle-input"
                  />
                  <label :for="permission.key" class="toggle-label">
                    <span class="toggle-button"></span>
                  </label>
                </div>
              </div>
            </div>
          </template>
        </LmCard>
      </Col>
      
      <Col :xs="12">
        <div class="settings-actions">
          <button @click="saveSettings" class="lm-button primary">
            <span class="material-symbols-outlined">save</span>
            Save Settings
          </button>
          <button @click="resetSettings" class="lm-button secondary">
            <span class="material-symbols-outlined">refresh</span>
            Reset to Default
          </button>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import LmCard from "../../../components/cards/card.vue";
import Row from "../../../components/container/row.vue";
import Col from "../../../components/container/col.vue";
import { inject, ref, reactive } from 'vue'

const app = inject('app')

const localSettings = reactive({
  name: app.value?.name || '',
  description: app.value?.description || '',
  autoStart: false,
  notifications: true,
  permissions: {
    fileSystem: true,
    network: true,
    camera: false,
    microphone: false,
    location: false
  }
})

const permissions = ref([
  {
    key: 'fileSystem',
    name: 'File System Access',
    description: 'Read and write files on your computer',
    icon: 'folder'
  },
  {
    key: 'network',
    name: 'Network Access',
    description: 'Make network requests and connect to the internet',
    icon: 'wifi'
  },
  {
    key: 'camera',
    name: 'Camera Access',
    description: 'Use your device camera',
    icon: 'camera_alt'
  },
  {
    key: 'microphone',
    name: 'Microphone Access',
    description: 'Record audio from your microphone',
    icon: 'mic'
  },
  {
    key: 'location',
    name: 'Location Access',
    description: 'Access your current location',
    icon: 'location_on'
  }
])

const saveSettings = () => {
  // Here you would save the settings to your backend
  console.log('Saving settings:', localSettings)
  // Show success notification
}

const resetSettings = () => {
  localSettings.name = app.value?.name || ''
  localSettings.description = app.value?.description || ''
  localSettings.autoStart = false
  localSettings.notifications = true
  localSettings.permissions = {
    fileSystem: true,
    network: true,
    camera: false,
    microphone: false,
    location: false
  }
}
</script>

<style scoped>
.settings-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-header .material-symbols-outlined {
  color: var(--primary-500);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--on-surface);
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--surface-variant);
  border-radius: 8px;
  background: var(--surface);
  color: var(--on-surface);
  font-size: 0.9rem;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: var(--surface-variant);
  border-radius: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-button {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-label {
  background: var(--primary-500);
}

.toggle-input:checked + .toggle-label .toggle-button {
  transform: translateX(1.5rem);
}

.toggle-text {
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--surface-variant);
  border-radius: 8px;
}

.permission-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.permission-info .material-symbols-outlined {
  color: var(--primary-500);
  font-size: 1.25rem;
}

.permission-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.permission-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem;
  background: var(--surface);
  border-radius: 8px;
  border: 1px solid var(--surface-variant);
}

.lm-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lm-button.primary {
  background: var(--primary-500);
  color: white;
}

.lm-button.primary:hover {
  background: var(--primary-600);
}

.lm-button.secondary {
  background: var(--surface);
  color: var(--on-surface);
  border: 1px solid var(--surface-variant);
}

.lm-button.secondary:hover {
  background: var(--surface-variant);
}

.lm-button .material-symbols-outlined {
  font-size: 1rem;
}
</style> 