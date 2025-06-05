<template>
  <div>
    <div class="status-container">
      <div v-for="status in statuses" :key="status.value" class="status-item">
        <div class="status-icon">
          <component
            :is="getIconByStatus(status.type)"
            :size="18"
            :color="getColorByStatus(status.type)"
          />
        </div>
        <div
          class="status-text"
          :style="{ color: getColorByStatus(status.type) }"
        >
          {{ status.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SuccessIcon from "../../icon/icons/success.vue";
import ErrorIcon from "../../icon/icons/error.vue";
import CautionIcon from "../../icon/icons/caution.vue";

const props = defineProps({
  statuses: {
    type: Array,
    default: () => [],
  },
  status: {
    type: String,
    default: "",
  },
  statusType: {
    type: String,
    default: "info",
    validator: (value) =>
      ["success", "error", "caution", "info"].includes(value),
  },
  statusMessage: {
    type: String,
    default: "",
  },
});

const statusIcon = computed(() => {
  switch (props.statusType) {
    case "success":
      return SuccessIcon;
    case "error":
      return ErrorIcon;
    case "caution":
      return CautionIcon;
    default:
      return null;
  }
});

const statusColor = computed(() => {
  switch (props.statusType) {
    case "success":
      return "#10b981"; // Green
    case "error":
      return "#ef4444"; // Red
    case "caution":
      return "#f59e0b"; // Amber/Yellow
    default:
      return "#60a5fa"; // Blue for info
  }
});

const getIconByStatus = (type) => {
  switch (type) {
    case "success":
      return SuccessIcon;
    case "error":
      return ErrorIcon;
    case "caution":
      return CautionIcon;
    default:
      return null;
  }
};

const getColorByStatus = (type) => {
  switch (type) {
    case "success":
      return "#10b981"; // Green
    case "error":
      return "#ef4444"; // Red
    case "caution":
      return "#f59e0b"; // Amber/Yellow
    default:
      return "#60a5fa"; // Blue for info
  }
};
</script>

<style scoped>
.status-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-size: 14px;
  line-height: 1.4;
}
</style>