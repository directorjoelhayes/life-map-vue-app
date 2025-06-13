<template>
  <LmContainer>
    <div class="lm-header" v-view-transition-name="'app-detail-header'">
      <span class="material-symbols-outlined">app_registration</span>
      <h1>{{ app.name }}</h1>
      <span class="lm-chip">V{{ app.version }}</span>
    </div>
    
    <Tabs :tabs="tabs" />
  </LmContainer>
</template>

<script setup>
import LmContainer from "../../components/container/lm-container.vue";
import Tabs from "../../components/tabs/tabs.vue";
import { useRoute } from "vue-router";
import { onBeforeMount, ref, provide } from "vue";
import axios from "axios";

const route = useRoute()
const app = ref({})

const tabs = [
  {
    name: 'overview',
    label: 'Overview',
    icon: 'info',
    to: `/apps/${route.params.id}/overview`
  },
  {
    name: 'history',
    label: 'History',
    icon: 'history',
    to: `/apps/${route.params.id}/history`
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: 'settings',
    to: `/apps/${route.params.id}/settings`
  }
]

// Provide the app data to child components
provide('app', app)

onBeforeMount(async () => {
  try {
    const appId = route.params.id;

    const response = await axios.get(
      `http://localhost:3012/app-dev/${appId}/get-app-registry`
    );
    app.value = response.data;
  } catch (error) {
    console.error(error);
  }
});
</script>

<style scoped>
span.lm-chip {
    border-style: solid;
    border-width: 1px;
    border-color: var(--primary-500);
    padding: 5px;
    font-size: 12px;
    border-radius: 4px;
}

span.lm-chip {
    transform: translateY(-15%) translateX(10%);
}
</style>