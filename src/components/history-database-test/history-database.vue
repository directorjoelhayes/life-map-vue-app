<template>
  <div>
    <h1>History Database Test</h1>
  </div>
  <LmContainer>
    <Row>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="handlePut()">Put</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="handleDel()">Del</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="handlePut()">Multi Put</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="handlePut()">Multi Del</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="handleClear()">Clear</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="Database.undo()">Undo</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="Database.redo()">Redo</button>
      </Col>
    </Row>
    <Row>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <div
          class="lm-card"
          v-for="[key, value] in items"
          :key="key"
          :class="[
            { 'lm-card-active': key === Database.meta.currentKey },
            value.color,
          ]"
        >
          {{ value.title }}
        </div>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card update-card"  
            v-for="[key, update] in Database.updates" 
            :key="key"
            :class="[
              { 'lm-card-active': key === Database.meta.currentKey }
            ]"
        >
          <div class="lm-card-type" >
            {{ update.type }}
          </div>
          <div
            class="lm-card"
            :class="[
              { 'lm-card-active': key === Database.meta.currentKey },
              update.value.color,
            ]"
          >
            {{ update.value.title }}
          </div>
        </div>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <!-- {{ meta }} -->
      </Col>
    </Row>
  </LmContainer>
</template>

<script setup>
import LmCard from "../../components/cards/card.vue";
import LmContainer from "../../components/container/lm-container.vue";
import Row from "../../components/container/row.vue";
import Col from "../../components/container/col.vue";

import { reactive, computed, onMounted, ref, onBeforeMount, onBeforeUnmount } from "vue";
import { ulid } from "ulid";

import makeDataStore from "../../stores/make-data-store";
import composeDataStore from "../../stores/compose-data-store";

const useDbHistory = makeDataStore("dbHistoryTest");
const Database = useDbHistory();

const items = reactive(new Map());


onBeforeMount(async () => {
  const db = await Database.loadDb();

  items.clear();

  const savedItems = Database.getAll;

  savedItems.forEach((item) => {
    items.set(item.id, item);
  });
});

const unsubscribe = composeDataStore({
  store: Database,
  data: items,
  runAfter: async ({ data, name, deletedItems }) => {
    //update selected items
    // selectedItems.value = selectedItems.value.filter((id) => {
    //   return data.has(id);
    // });
    Database.saveDb();
  },
});

function handlePut() {
  const id = ulid();

  const prefixes = [
    "Dr.",
    "Mr.",
    "Mrs.",
    "Ms.",
    "Prof.",
    "Sir",
    "Lady",
    "Lord",
    "Baron",
    "Baroness",
    "Earl",
    "Earless",
    "Viscount",
  ];

  const randomNamesColors = [
    ["apple", "red"],
    ["banana", "yellow"],
    ["cherry", "red"],
    ["date", "orange"],
    ["elderberry", "purple"],
    ["fig", "brown"],
    ["grape", "purple"],
    ["honeydew", "green"],
    ["kiwi", "green"],
    ["lemon", "yellow"],
    ["mango", "orange"],
    ["nectarine", "orange"],
    ["orange", "orange"],
  ];

  function random(pickRandom) {
    const randomIndex = Math.floor(Math.random() * pickRandom.length);
    return pickRandom[randomIndex];
  }

  const lastItem = items.get(items.keys().next().value);

  let randomName = random(randomNamesColors);
  if (lastItem) {
    randomName = randomName.filter((item) => item[1] !== lastItem[1]);
  }

  Database.put(id, {
    id,
    title: random(prefixes) + " " + randomName[0],
    color: randomName[1],
    width: 200,
    height: 20,
  });
}

function handleDel() {
  Array.from(items.keys()).forEach((key, index) => {
    if (index === 0) {
      Database.del(key, items.get(key));
    }
  });
}

function handleClear() {
  Database.clearDb();
}

const keysPressed = [];

function handleUndo(e) {
  if (e.key === "z" && e.ctrlKey && !e.shiftKey) {
    Database.undo();
  }
}

function handleRedo(e) {
  if (e.key === "z" && e.ctrlKey && e.shiftKey) {
    Database.redo();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleUndo);
  window.addEventListener("keydown", handleRedo);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleUndo);
  window.removeEventListener("keydown", handleRedo);
});
</script>

<style scoped>

.lm-card {
  border-style: solid;
  padding: 5px;
  border-width: 1px;
  border-radius: 5px;
  margin-bottom: 5px;
}
.red {
  color: #a83232;
}

.yellow {
  color: #b3a136;
}

.orange {
  color: #b36f36;
}

.purple {
  color: #7a4b8d;
}

.green {
  color: #4c7a4b;
}

.brown {
  color: #6e5741;
}

.blue {
  color: #3a5a8c;
}

.pink {
  color: #a36985;
}

.gray {
  color: #5a5a5a;
}

.black {
  color: #333333;
}

.white {
  color: #e6e6e6;
}

.orange {
  color: orange;
}

.purple {
  color: purple;
}


.update-card {
  opacity: 0.5;
  border-style: dashed;
}

.update-card.lm-card-active {
  opacity: 1;
}


</style>
