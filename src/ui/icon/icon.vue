<template>
  <span 
    class="icon" 
    :class="{ clickable: onClick }"
    @click="handleClick"
  >
    <component 
      :is="iconComponent" 
      v-if="iconComponent"
      :size="size"
      :color="color"
    />
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Name of the icon to display
  name: {
    type: String,
    required: true
  },
  // Size in pixels
  size: {
    type: [Number, String],
    default: 24
  },
  // Color of the icon
  color: {
    type: String,
    default: 'currentColor'
  },
  // Optional click handler
  onClick: {
    type: Function,
    default: null
  }
});

const iconComponent = computed(() => {
  try {
    // Dynamic import of the icon component
    return () => import(`./icons/${props.name}.vue`);
  } catch (error) {
    console.error(`Icon "${props.name}" not found`);
    return null;
  }
});

const handleClick = (event) => {
  if (props.onClick) {
    props.onClick(event);
  }
};
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  opacity: 0.8;
}
</style> 