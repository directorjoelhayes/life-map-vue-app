<template>
  <div class="app-overview">
    <Row :gap="'1.5rem'">
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <LmCard>
          <template #header>
            <div class="app-info">
              <template v-if="app.icon">
                <img
                  v-if="app.icon.type === 'url'"
                  :src="app.icon.url"
                  alt="app icon"
                  class="app-icon"
                />
                <img v-else :src="app.icon.data" alt="app icon" class="app-icon" />
              </template>
              <div>
                <h2>{{ app.name }}</h2>
                <p class="app-version">Version {{ app.version }}</p>
              </div>
            </div>
          </template>
          <template #body>
            <div class="app-details">
              <p v-if="app.description">{{ app.description }}</p>
              <p v-else>No description available</p>
              
              <div class="app-meta" v-if="app.author || app.created_date">
                <p v-if="app.author"><strong>Author:</strong> {{ app.author }}</p>
                <p v-if="app.created_date"><strong>Created:</strong> {{ formatDate(app.created_date) }}</p>
              </div>
            </div>
          </template>
        </LmCard>
      </Col>
      
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <LmCard>
          <template #header>
            <h3>Quick Actions</h3>
          </template>
          <template #body>
            <div class="quick-actions">
              <button class="lm-button primary">Launch App</button>
              <button class="lm-button secondary">View Code</button>
              <button class="lm-button secondary">Settings</button>
            </div>
          </template>
        </LmCard>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import LmCard from "../../../components/cards/card.vue";
import Row from "../../../components/container/row.vue";
import Col from "../../../components/container/col.vue";
import { inject } from 'vue'

const app = inject('app')

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.app-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.app-version {
  color: var(--on-surface-variant);
  margin: 0;
  font-size: 0.9rem;
}

.app-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface);
}

.app-meta p {
  margin: 0;
  font-size: 0.9rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lm-button {
  padding: 0.75rem 1rem;
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
</style> 