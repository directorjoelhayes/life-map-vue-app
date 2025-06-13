<template>
  <div class="device-list">
    <div class="settings-header">
      <span class="material-symbols-outlined">devices</span>
      <h2>Devices</h2>
    </div>
    <Row :gap="'1.5rem'">
      <template v-if="loading">
        <div class="loading">Loading...</div>
      </template>
      <template v-else>
        <Col
          v-for="device in devices"
          :key="device.id"
          :xs="12"
          :sm="6"
          :md="4"
          :lg="3"
        >
          <LmCard class="device-card">
            <template #header>
              <img
                :src="getIcon(device.system.manufacturer)"
                class="device-icon"
              />
              <h3>{{ device.system.manufacturer }}</h3>
            </template>
            <template #body>
              <p>{{ device.system.model }}</p>
            </template>
            {{ device.system }}
          </LmCard>
        </Col>
      </template>
    </Row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import LmCard from "../cards/card.vue";
import Row from "../container/row.vue";
import Col from "../container/col.vue";

const loading = ref(true);

const devices = ref([
  {
    name: "Device 1",
    status: "Online",
  },
]);

const getIcon = (name) => {
  switch (name) {
    case "Alienware":
      return "https://www.google.com/s2/favicons?sz=128&domain=alienware.com";
    case "Apple":
      return "https://www.google.com/s2/favicons?sz=64&domain=apple.com";
    case "Dell":
      return "https://www.google.com/s2/favicons?sz=64&domain=asus.com";
    case "Dell":
      return "https://www.google.com/s2/favicons?sz=64&domain=dell.com";
    case "Google":
      return "https://www.google.com/s2/favicons?sz=64&domain=google.com";
    case "Lenovo":
      return "https://www.google.com/s2/favicons?sz=64&domain=lenovo.com";
    case "Microsoft":
      return "https://www.google.com/s2/favicons?sz=64&domain=microsoft.com";
    case "Razer":
      return "https://www.google.com/s2/favicons?sz=64&domain=razer.com";
  }
};

onMounted(async () => {
  const response = await axios.get("http://localhost:3012/devices");
  console.log(response.data);
  devices.value = response.data;
  loading.value = false;
});
</script>

<style scoped>
img.device-icon {
  border-style: solid;
  border-width: 1px;
  border-color: var(--surface-200);
  border-radius: 10px;
  width: 80px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.device-card {
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  border-color: var(--surface-400);
}

h3 {
  margin: 0px;
}

:deep(.lm-card-header) {
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--surface-600);
}

img.device-icon {
    width: 50px;
    border-color: var(--surface-300);
}
</style>