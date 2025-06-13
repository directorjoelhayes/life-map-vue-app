<template>
  <div class="search-page">
    <SearchBoxSearchPage
      @search="handleSearch"
      :results="results"
      @select="handleAction"
      @enter="handleAction"
      :shortCodeMatch="shortCodeMatch"
      :actionEventSource="actionEventSource"
    />
  </div>
</template>

<script setup>
import SearchBoxSearchPage from "./search-box-search-page.vue";
import { ref, onBeforeMount } from "vue";
import axios from "axios";
import fuzzySearch from "fuzzy-search";
const results = ref([]);
const searchData = ref([]);
const shortCodeMatch = ref(false);
import { actions } from "../../data-access";
let Search = null;

const actionEventSource = ref(false);

onBeforeMount(async () => {
  const response = await axios.get("/search.json");
  searchData.value = response.data;

  Search = new fuzzySearch(response.data, ["name", "description", "tags"], {
    caseSensitive: false,
  });
});

const handleSearch = (query) => {
  //shortCode match
  const match = searchData.value.find(({ shortCode }) => shortCode === query);
  if (match) {
    shortCodeMatch.value = match;
  } else {
    shortCodeMatch.value = false;
  }
  results.value = Search.search(query);
};

async function handleAction(e) {
  console.log(e, "event");
  for (let i = 0; i < e.actions.length; i++) {
    //open component
    const action = e.actions[i];
    const func = Object.keys(e.actions[i])[0];

    if (func === "mountComponent") {
      this.loadComponent(action[func]);
      return;
    }

    console.log(func, "func", actions[func]);

    const response = await actions[func](action[func]);
    actionEventSource.value = response;
  }
  shortCodeMatch.value = false;
}
</script>

<style scoped>
.search-page {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
