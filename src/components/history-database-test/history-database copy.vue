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
        <button @click="handleClear()">Clear</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="Database.actions.undo()">Undo</button>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <button @click="Database.actions.redo()">Redo</button>
      </Col>
    </Row>
    <Row>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        <div
          class="lm-card"
          v-for="[key, value] in updates"
          :key="key"
          :class="{ 'lm-card-active': key === meta.currentKey }"
        >
          {{ value.type }} | {{ value.action }} | {{ value.id.split(':')[0].slice(10, value.id.length) }}
        </div>
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        {{ Database.getAll }}
      </Col>
      <Col xs="12" :sm="6" :md="4" :lg="3">
        {{ meta }}
      </Col>
    </Row>
  </LmContainer>
</template>

<script setup>
import LmCard from "../../components/cards/card.vue";
import LmContainer from "../../components/container/lm-container.vue";
import Row from "../../components/container/row.vue";
import Col from "../../components/container/col.vue";

import { reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { ulid } from "ulid";

const db = reactive(new Map());
const updates = reactive(new Map());
const meta = reactive({
  historySize: 15,
  clearThreshold: {
    increment: 20,
    clearNumber: 5,
  },
  updates: 0,
  currentIndex: 0,
  currentKey: "",
});

function handlePut() {
  Database.actions.put(ulid(), "test");
}

function handleClear() {
  Database.actions.clear();
}

function dbWrapper({ updates, db, meta } = {}) {
  //updates proxy

  const getAll = computed(() => {
    //cloned db
    const clonedDb = new Map(db);

    const updatesArray = Array.from(updates.entries());

    // If no current key, just return the cloned db
    if (!meta.currentKey) {
      return clonedDb;
    }

    const currentIndex = updatesArray.findIndex(
      ([key]) => key === meta.currentKey
    );

    // If key not found, return the cloned db
    if (currentIndex === -1) {
      return clonedDb;
    }

    //sliced updates
    const slicedUpdates = updatesArray.slice(0, currentIndex + 1);

    //apply updates to cloned db
    for (const [key, update] of slicedUpdates) {
      if (update.type === "put") {
        clonedDb.set(update.target, update.value);
      }
      if (update.type === "del") {
        clonedDb.delete(update.target);
      }
    }

    return clonedDb;
  });

  const treeCheck = () => {
    const updatesArray = Array.from(updates.entries());
    const currentIndex = updatesArray.findIndex(
      ([key]) => key === meta.currentKey
    );

    if (currentIndex === -1) {
      return;
    }

    if (currentIndex < updatesArray.length - 1) {
        //slice at current index
        const slicedUpdates = updatesArray.slice(currentIndex + 1, updatesArray.length);

        //delete all updates after current index
        for (const [key, update] of slicedUpdates) {
          if (update.type === "put") {
            updates.delete(key);
          }
        }

        //update meta
        meta.updates = currentIndex + 1;
        
    } 
    
  };

  return {
    updates,
    db,
    getAll,
    actions: {
      put: (key, value) => {

        treeCheck();

        const updateKey = `${ulid()}:${key}`;

        //get the last update
        const lastUpdate = updates.get(updateKey);

        //format update
        const update = {
          id: updateKey,
          //helps keep chain of updates if distributed
          last: lastUpdate,
          target: key,
          type: "put",
          action: "Update user",
          timestamp: Date.now(),
          key,
          value,
        };

        updates.set(updateKey, update);
        meta.currentKey = updateKey;
        meta.updates++;

        if (meta.updates === meta.clearThreshold.increment) {
          Database.actions.bulkUpdates(updates);
          meta.updates = meta.historySize;
        }
      },
      del: (key) => {

        treeCheck();

        const updateKey = `${ulid()}:${key}`;
        updates.set(updateKey, {
          id: updateKey,
          type: "del",
          target: key,
          action: "Delete user",
          timestamp: Date.now(),
        });
      },
      bulkUpdates: (updates) => {
        //select clear number of updates
        const clearNumber = meta.clearThreshold.clearNumber;
        // Maps don't have slice method - convert to array, slice, then process
        const updatesArray = Array.from(updates.entries());
        const clearUpdates = updatesArray.slice(0, clearNumber);

        for (const [key, update] of clearUpdates) {
          if (update.type === "put") {
            db.set(update.target, update.value); // Using .set() for Map
          }
          if (update.type === "del") {
            db.delete(update.target);
          }
        }

        //remove clear updates from updates
        clearUpdates.forEach(([key]) => {
          updates.delete(key);
        });
      },
      get: (id) => {
        // Loop through all keys in a map
        for (const [key, update] of updates) {
          if (key.split(":")[1] === id) {
            if (update.type === "put") {
              return update.value;
            }
            if (update.type === "del") {
              return null;
            }
          }
        }

        return db.get(id);
      },
      undo: () => {
        const updatesArray = Array.from(updates.entries());
        
        if (updatesArray.length === 0) return; // No updates to undo
        
        if (!meta.currentKey && updatesArray.length > 0) {
          // No current position, nothing to undo
          return;
        }
        
        const currentIndex = updatesArray.findIndex(
          ([key]) => key === meta.currentKey
        );
        
        // Only undo if we're not at the beginning
        if (currentIndex > 0) {
          meta.currentKey = updatesArray[currentIndex - 1][0];
          meta.updates--;
        }
      },
      redo: () => {
        const updatesArray = Array.from(updates.entries());
        
        if (updatesArray.length === 0) return; // No updates to redo
        
        if (!meta.currentKey) {
          // No current position, start at the beginning
          meta.currentKey = updatesArray[0][0];
          meta.updates = 1;
          return;
        }
        
        const currentIndex = updatesArray.findIndex(
          ([key]) => key === meta.currentKey
        );
        
        // Only redo if we're not at the end
        if (currentIndex < updatesArray.length - 1) {
          meta.currentKey = updatesArray[currentIndex + 1][0];
          meta.updates++;
        }
      },
      clear: () => {
        updates.clear();
        db.clear();
        meta.currentKey = "";
        meta.updates = 0;
      },
    },
  };
}


const keysPressed = [];

function handleUndo(e) {
  if (e.key === "z" && e.ctrlKey && !e.shiftKey) {
    Database.actions.undo();
  }
}

function handleRedo(e) {
  if (e.key === "z" && e.ctrlKey && e.shiftKey) {
    Database.actions.redo();
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

const Database = dbWrapper({
  updates,
  db,
  meta,
});
</script>

<style scoped>
.lm-card-active {
  color: var(--primary);
}
</style>
