<template>
    <div class="lm-card">
        <div class="lm-card-header">
            <slot name="header">Header</slot>
        </div>
        <div class="lm-card-body">
            <slot name="body">Body</slot>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        padding: {
            type: String,
            default: '1rem'
        }
    })
</script>

<style scoped>
.lm-card {
  background-color: var(--surface-500);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.lm-card-header {
  padding: 1rem;
  background-color: var(--surface-500);
}

.lm-card-body {
  padding: 1rem;
  flex-grow: 1;
}

.lm-card h3 {
  margin: 0;
  color: var(--text-primary, inherit);
}
</style>
