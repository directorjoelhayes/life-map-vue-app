<template>
    <div class="lm-col" :style="colStyle">
        <slot></slot>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    xs: { type: [Number, String], default: '12' },
    sm: { type: [Number, String], default: null },
    md: { type: [Number, String], default: null },
    lg: { type: [Number, String], default: null },
    xl: { type: [Number, String], default: null },
    padding: { type: String, default: null }
});

const colStyle = computed(() => ({
    '--xs': typeof props.xs === 'number' ? `${(props.xs / 12) * 100}%` : props.xs,
    '--sm': props.sm !== null ? (typeof props.sm === 'number' ? `${(props.sm / 12) * 100}%` : props.sm) : null,
    '--md': props.md !== null ? (typeof props.md === 'number' ? `${(props.md / 12) * 100}%` : props.md) : null,
    '--lg': props.lg !== null ? (typeof props.lg === 'number' ? `${(props.lg / 12) * 100}%` : props.lg) : null,
    '--xl': props.xl !== null ? (typeof props.xl === 'number' ? `${(props.xl / 12) * 100}%` : props.xl) : null,
    '--padding': props.padding
}));
</script>

<style scoped>
.lm-col {
    position: relative;
    width: 100%;
    padding-right: calc(var(--padding, var(--gap, 1rem)) * 0.5);
    padding-left: calc(var(--padding, var(--gap, 1rem)) * 0.5);
    padding-top: calc(var(--padding, var(--gap, 1rem)) * 0.5);
    padding-bottom: calc(var(--padding, var(--gap, 1rem)) * 0.5);
    box-sizing: border-box;
    flex: 0 0 var(--xs, 100%);
    max-width: var(--xs, 100%);
}

/* Container query breakpoints */
@container (min-width: 576px) {
    .lm-col {
        flex: 0 0 var(--sm, var(--xs, 100%));
        max-width: var(--sm, var(--xs, 100%));
    }
}

@container (min-width: 768px) {
    .lm-col {
        flex: 0 0 var(--md, var(--sm, var(--xs, 100%)));
        max-width: var(--md, var(--sm, var(--xs, 100%)));
    }
}

@container (min-width: 992px) {
    .lm-col {
        flex: 0 0 var(--lg, var(--md, var(--sm, var(--xs, 100%))));
        max-width: var(--lg, var(--md, var(--sm, var(--xs, 100%))));
    }
}

@container (min-width: 1200px) {
    .lm-col {
        flex: 0 0 var(--xl, var(--lg, var(--md, var(--sm, var(--xs, 100%)))));
        max-width: var(--xl, var(--lg, var(--md, var(--sm, var(--xs, 100%)))));
    }
}

@supports not (container-type: inline-size) {
    /* Fallback for browsers that don't support container queries */
    @media (min-width: 576px) {
        .lm-col {
            flex: 0 0 var(--sm, var(--xs, 100%));
            max-width: var(--sm, var(--xs, 100%));
        }
    }

    @media (min-width: 768px) {
        .lm-col {
            flex: 0 0 var(--md, var(--sm, var(--xs, 100%)));
            max-width: var(--md, var(--sm, var(--xs, 100%)));
        }
    }

    @media (min-width: 992px) {
        .lm-col {
            flex: 0 0 var(--lg, var(--md, var(--sm, var(--xs, 100%))));
            max-width: var(--lg, var(--md, var(--sm, var(--xs, 100%))));
        }
    }

    @media (min-width: 1200px) {
        .lm-col {
            flex: 0 0 var(--xl, var(--lg, var(--md, var(--sm, var(--xs, 100%)))));
            max-width: var(--xl, var(--lg, var(--md, var(--sm, var(--xs, 100%)))));
        }
    }
}
</style>
