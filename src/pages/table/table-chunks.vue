<template>
  <slot />
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  idKey: {
    type: String,
    default: "id",
  },
  items: {
    type: Array,
    required: true,
  },
});

onMounted(() => {
  console.log(props.items);
});



</script>