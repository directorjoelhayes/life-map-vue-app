<template>
  <div class="checkbox-container">
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      :disabled="disabled"
      class="checkbox-input"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <label :for="id" class="checkbox-label">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<script>
export default {
  name: 'UiCheckbox',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.checkbox-input {
  margin-right: 8px;
}

.checkbox-label {
  cursor: pointer;
}

.checkbox-input:disabled + .checkbox-label {
  cursor: not-allowed;
  opacity: 0.6;
}
</style> 