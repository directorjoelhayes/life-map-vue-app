<template>
    <div class="lm-container" :class="{ 'fluid': fluid }">
        <slot></slot>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    fluid: {
        type: Boolean,
        default: false
    },
    padding: {
        type: String,
        default: '1rem'
    }
});

const containerStyle = computed(() => ({
    '--padding': props.padding
}));
</script>

<style scoped>
.lm-container {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    padding-right: var(--padding, 1rem);
    padding-left: var(--padding, 1rem);
    box-sizing: border-box;
}

.lm-container:not(.fluid) {
    max-width: 1200px;
}
</style>
