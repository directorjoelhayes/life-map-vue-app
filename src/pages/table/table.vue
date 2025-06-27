<template>
  <LmContainer>
    <Row>
      <div>
        <h1>Table Data</h1>
      </div>
      <div class="container" v-show="false">
        <div class="bar" id="one"></div>
        <div class="bar" id="two"></div>
        <div class="bar" id="three"></div>
        <div class="bar" id="four"></div>
        <div class="bar" id="five"></div>
        <div class="bar" id="six"></div>
        <div class="bar" id="seven"></div>
        <div class="bar" id="eight"></div>
      </div>
    </Row>
    <Row :gap="'1.5rem'">
      <Col>
        <DataTableFlex
          ref="tableRef"
          :headers="headers"
          :rows="rows"
          :selectable="true"
        >
          <template #name="{ item }">
            <div>{{ item.name }} {{ item.id }}</div>
          </template>
        </DataTableFlex>
      </Col>
    </Row>
  </LmContainer>
</template>
  
<script setup>
import { ref, onMounted } from "vue";
import DataTableFlex from "./data-table-flex.vue";
import externalData from "./external-data";

const tableRef = ref(null);

const headers = ref([
  { 
    name: "Name", 
    key: "name",
    rawSort: (a, b) => {
      return a.id - b.id;
    }
  },
  { name: "Email", key: "email" },
  { name: "Price", key: "price" },
  { name: "Role", key: "role" },
]);

const rows = ref(
  Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    price: index + 1 * 100,
    role: index % 3 === 0 ? "Admin" : index % 2 === 0 ? "Editor" : "Viewer",
  }))
);

const priceData = externalData(rows.value);

function randomSort() {
  const sortedRows = [...rows.value].sort((a, b) => {
    return Math.random() - 0.5;
  });
  // Iterate directly over the first 30 indices
}

onMounted(() => {
  // setInterval(async () => {
  //   const updates = [];
  //   priceData.getUpdates().forEach((row) => {
  //     updates.push([row.id, { price: row.price }]);
  //   });

  //   tableRef.value.updateRows(updates);
  // }, 2000);

  var bars, current, rotation, last;

  bars = document.querySelectorAll(".bar");
  current = 0;
  last = 0;

  rotation = setInterval(function () {
    bars[last].style.opacity = 0.4;
    bars[current].style.opacity = 1;
    last = current;
    if (current === bars.length - 1) {
      current = 0;
    } else {
      current++;
    }
  }, 80);
});
</script>

<style scoped>
.bar {
  width: 5px;
  height: 15px;
  background-color: grey;
  position: absolute;
  opacity: 0.4;
  border-radius: 2px;
}
.container {
  position: relative;
  width: 34px;
  height: 42px;
}
#two,
#six {
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
}
#three,
#seven {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
}
#four,
#eight {
  -webkit-transform: rotate(135deg);
  transform: rotate(135deg);
}
#one {
  top: 0;
  left: 15px;
}
#two {
  top: 4px;
  left: 25px;
}
#three {
  top: 13px;
  left: 30px;
}
#four {
  top: 23px;
  left: 25px;
}
#five {
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg);
  top: 27px;
  left: 15px;
}
#six {
  top: 23px;
  left: 5px;
}
#seven {
  top: 13px;
  left: 0;
}
#eight {
  top: 4px;
  left: 5px;
}
</style>
  
  
  