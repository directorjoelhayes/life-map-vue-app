<template>
  <div class="search-field-wrapper">
    <div class="search-field input-container">
      <input
        :placeholder="placeholder"
        v-model="query"
        @input="handleSearch"
        @keydown="handleInput"
      />
      <SearchIcon v-if="!loading" :size="20" color="#ffffff" class="icon" />
      <SpinnerIcon v-else :size="20" color="#ffffff" class="icon" />
      <kbd v-if="shortCodeMatch">{{ shortCodeMatch.shortCode }}</kbd>
    </div>
    
    <field-status :statuses="statuses" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import SearchIcon from "../../icon/icons/search.vue";
import SpinnerIcon from "../../icon/icons/spinner.vue";
import FieldStatus from "../status/field-status.vue";
import rulesHandler from "../rules-handler.js";
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "search for anything..",
  },
  showShortCode: {
    type: Boolean,
    default: true,
  },
  shortCodes: {
    type: Array,
    default: [],
  },
  searchData: {
    type: Array,
    default: [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array,
    default: [
    ],
  },
  rulesOnInput: {
    type: Boolean,
    default: true,
  },
  rulesOnBlur: {
    type: Boolean,
    default: false,
  },
});

const query = ref(props.modelValue || "");

const emit = defineEmits(["update:modelValue", "search", "shortCode"]);

const shortCodeMatch = ref(null);

const validate = ref(false);

const statuses = defineModel('statuses', { default: () => [] });



const handleSearch = () => {
  console.log(query.value, "query");
  emit("search", query.value);
  if (props.rulesOnInput && props.rules.length > 0) {
    const rules = rulesHandler({ rules: props.rules, value: query.value });
    console.log(rules);
    validate.value = rules.some((rule) => rule.type === "error");
    statuses.value.splice(0, statuses.value.length, ...rules);
  }
};

const handleInput = (e) => {
  e.stopPropagation();
  if (e.key === "Enter") {
    emit("search", query.value);
    query.value = "";
    emit("update:modelValue", "");
    emit("enter");
  }
  if (e.key === "Escape") {
    query.value = "";
    emit("update:modelValue", "");
    emit("escape");
  }
};
</script>

<style scoped>
@import "../field-styles.css";

input {
  font-family: "Open Sans";
  color: #ffffff;
  width: 400px;
  border: none;
  background: none;
  font-size: 22px;
  padding: 10px;
  font-weight: 300;
}

input:focus {
  outline: none;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}

.search-field kbd {
  position: absolute;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
}
</style>
