<template>
    <div class="lm-row" :style="rowStyle">
        <slot></slot>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    gap: {
        type: String,
        default: '1rem'
    }
});

const rowStyle = computed(() => ({
    '--gap': props.gap
}));
</script>

<style scoped>
.lm-row {
    container-type: inline-size;
    display: flex;
    flex-wrap: wrap;
    margin-right: calc(var(--gap, 1rem) * -0.5);
    margin-left: calc(var(--gap, 1rem) * -0.5);
    box-sizing: border-box;
    margin-top: calc(var(--gap, 1rem) * -0.5);
    margin-bottom: calc(var(--gap, 1rem) * -0.5);
}
</style>
