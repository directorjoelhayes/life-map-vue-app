<template>
  <LmContainer>
    <div class="lm-header">
      <span class="material-symbols-outlined">apps</span>
      <h1>Apps</h1>
    </div>
    <Row>
      <Col
        v-for="(app, index) in apps"
        :key="app.id"
        :xs="12"
        :sm="6"
        :md="4"
        :lg="3"
      >
        <router-link :to="`/apps/${app.id}/overview`" class="lm-graphic-card" v-view-transition-name="`app-card-${app.id}`">
          <div
            class="lm-graphic-background"
            :class="getGradientClass(index)"
          ></div>
          <div class="lm-content">
            <div class="lm-graphic-card-header">
              <template v-if="app.icon">
                <img
                  v-if="app.icon.type === 'url'"
                  :src="app.icon.url"
                  alt="app icon"
                  v-view-transition-name="`app-icon-${app.id}`"
                />
                <img v-else :src="app.icon.data" alt="app icon" v-view-transition-name="`app-icon-${app.id}`" />
              </template>
              <h2 v-view-transition-name="`app-title-${app.id}`">{{ app.name }}</h2>
            </div>
            <div class="lm-graphic-card-body">
              <p>V{{ app.version }}</p>
            </div>
          </div>
        </router-link>
      </Col>
    </Row>
  </LmContainer>
</template>

<script setup>
import LmContainer from "../../components/container/lm-container.vue";
import Row from "../../components/container/row.vue";
import Col from "../../components/container/col.vue";
import LmCard from "../../components/cards/card.vue";
import { onMounted, ref } from "vue";
import axios from "axios";

const apps = ref([]);

const gradientClasses = [
  "lm-gradient-orange",
  "lm-gradient-blue",
  "lm-gradient-purple",
  "lm-gradient-green",
  "lm-gradient-pink",
  "lm-gradient-teal",
  "lm-gradient-red",
];

const getGradientClass = (index) => {
  return gradientClasses[index % gradientClasses.length];
};

onMounted(async () => {
  const response = await axios.get(
    "http://localhost:3012/app-dev/get-app-registry"
  );
  console.log(response.data);
  apps.value = response.data;
});
</script>

<style scoped>
/* ::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
  animation-timing-function: ease;
}

::view-transition-old(root) {
  animation-name: fade-out;
}
::view-transition-new(root) {
  animation-name: fade-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
} */

/* Orange Gradient */
.lm-gradient-orange {
  background-image: linear-gradient(
    33deg,
    rgb(89, 74, 10) 0%,
    rgb(89, 74, 10) 14.286%,
    rgb(159, 92, 13) 14.286%,
    rgb(159, 92, 13) 28.571%,
    rgb(227, 118, 18) 28.571%,
    rgb(227, 118, 18) 42.857%,
    rgb(255, 150, 24) 42.857%,
    rgb(255, 150, 24) 57.143%,
    rgb(255, 188, 31) 57.143%,
    rgb(255, 188, 31) 71.429%,
    rgb(255, 230, 39) 71.429%,
    rgb(255, 230, 39) 85.714%,
    rgb(255, 255, 47) 85.714%,
    rgb(255, 255, 47) 100%
  );
}

/* Blue Gradient */
.lm-gradient-blue {
  background-image: linear-gradient(
    33deg,
    rgb(10, 25, 89) 0%,
    rgb(10, 25, 89) 14.286%,
    rgb(13, 71, 159) 14.286%,
    rgb(13, 71, 159) 28.571%,
    rgb(18, 118, 227) 28.571%,
    rgb(18, 118, 227) 42.857%,
    rgb(24, 150, 255) 42.857%,
    rgb(24, 150, 255) 57.143%,
    rgb(31, 188, 255) 57.143%,
    rgb(31, 188, 255) 71.429%,
    rgb(39, 230, 255) 71.429%,
    rgb(39, 230, 255) 85.714%,
    rgb(143, 247, 255) 85.714%,
    rgb(143, 247, 255) 100%
  );
}

/* Purple Gradient */
.lm-gradient-purple {
  background-image: linear-gradient(
    33deg,
    rgb(60, 10, 89) 0%,
    rgb(60, 10, 89) 14.286%,
    rgb(100, 13, 159) 14.286%,
    rgb(100, 13, 159) 28.571%,
    rgb(140, 18, 227) 28.571%,
    rgb(140, 18, 227) 42.857%,
    rgb(180, 24, 255) 42.857%,
    rgb(180, 24, 255) 57.143%,
    rgb(200, 75, 255) 57.143%,
    rgb(200, 75, 255) 71.429%,
    rgb(220, 120, 255) 71.429%,
    rgb(220, 120, 255) 85.714%,
    rgb(240, 180, 255) 85.714%,
    rgb(240, 180, 255) 100%
  );
}

/* Green Gradient */
.lm-gradient-green {
  background-image: linear-gradient(
    33deg,
    rgb(20, 89, 10) 0%,
    rgb(20, 89, 10) 14.286%,
    rgb(40, 159, 13) 14.286%,
    rgb(40, 159, 13) 28.571%,
    rgb(60, 227, 18) 28.571%,
    rgb(60, 227, 18) 42.857%,
    rgb(80, 255, 24) 42.857%,
    rgb(80, 255, 24) 57.143%,
    rgb(120, 255, 60) 57.143%,
    rgb(120, 255, 60) 71.429%,
    rgb(160, 255, 100) 71.429%,
    rgb(160, 255, 100) 85.714%,
    rgb(200, 255, 140) 85.714%,
    rgb(200, 255, 140) 100%
  );
}

/* Pink Gradient */
.lm-gradient-pink {
  background-image: linear-gradient(
    33deg,
    rgb(89, 10, 60) 0%,
    rgb(89, 10, 60) 14.286%,
    rgb(159, 13, 100) 14.286%,
    rgb(159, 13, 100) 28.571%,
    rgb(227, 18, 140) 28.571%,
    rgb(227, 18, 140) 42.857%,
    rgb(255, 24, 180) 42.857%,
    rgb(255, 24, 180) 57.143%,
    rgb(255, 75, 200) 57.143%,
    rgb(255, 75, 200) 71.429%,
    rgb(255, 120, 220) 71.429%,
    rgb(255, 120, 220) 85.714%,
    rgb(255, 180, 240) 85.714%,
    rgb(255, 180, 240) 100%
  );
}

/* Teal Gradient */
.lm-gradient-teal {
  background-image: linear-gradient(
    33deg,
    rgb(10, 89, 70) 0%,
    rgb(10, 89, 70) 14.286%,
    rgb(13, 159, 120) 14.286%,
    rgb(13, 159, 120) 28.571%,
    rgb(18, 227, 170) 28.571%,
    rgb(18, 227, 170) 42.857%,
    rgb(24, 255, 200) 42.857%,
    rgb(24, 255, 200) 57.143%,
    rgb(60, 255, 210) 57.143%,
    rgb(60, 255, 210) 71.429%,
    rgb(100, 255, 220) 71.429%,
    rgb(100, 255, 220) 85.714%,
    rgb(140, 255, 230) 85.714%,
    rgb(140, 255, 230) 100%
  );
}

/* Red Gradient */
.lm-gradient-red {
  background-image: linear-gradient(
    33deg,
    rgb(89, 10, 10) 0%,
    rgb(89, 10, 10) 14.286%,
    rgb(159, 13, 13) 14.286%,
    rgb(159, 13, 13) 28.571%,
    rgb(227, 18, 18) 28.571%,
    rgb(227, 18, 18) 42.857%,
    rgb(255, 24, 24) 42.857%,
    rgb(255, 24, 24) 57.143%,
    rgb(255, 75, 75) 57.143%,
    rgb(255, 75, 75) 71.429%,
    rgb(255, 120, 120) 71.429%,
    rgb(255, 120, 120) 85.714%,
    rgb(255, 180, 180) 85.714%,
    rgb(255, 180, 180) 100%
  );
}

.lm-graphic-background {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.6;
}

.lm-content {
  z-index: 1;
}

.lm-graphic-card {
  position: relative;
  padding-top: 56%;
  border-radius: 20px;
  overflow: hidden;
}

.lm-graphic-card h2,
.lm-graphic-card p {
  margin: 0px;
}

.lm-content {
  position: absolute;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

.lm-graphic-card {
  padding-top: 100% !important;
}

.lm-graphic-card:hover {
  cursor: pointer;
}

.lm-graphic-card:hover .lm-graphic-background {
  cursor: pointer;
  transform: scale(1.1);
  opacity: 0.7;
}

.lm-graphic-background {
  transition: transform 1s ease, opacity 300ms ease;
}

a.lm-graphic-card {
    display: flex;
    color: white;
}
</style>