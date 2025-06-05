<template>
  <div class="youtube-music-container">
    <template v-if="numberOneVideo">
      <div
        class="background-image"
        :style="{
          backgroundImage: `url(${numberOneVideo.snippet.thumbnails.default.url})`,
        }"
      ></div>
      <div class="youtube-music-header">
        <div class="youtube-music-header-left">
          <div class="youtube-music-header-left-item">
            <h2>{{ numberOneVideo.snippet.title }}</h2>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const likedVideos = ref([]);
const numberOneVideo = ref(null);

onMounted(async () => {
  const response = await axios.get(
    "http://localhost:3012/youtube-music/get-liked-videos"
  );

  console.log(response.data[0], "response");
  likedVideos.value = response.data.items;
  numberOneVideo.value = response.data.items[0];
});
</script>

<style scoped>
.youtube-music-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}
.background-image {
  position: absolute;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  left: -10px;
  top: -10px;
  background-size: cover;
  z-index: -1;
  filter: blur(10px);
  opacity: 0.9;
}
.background-image {
  filter: brightness(0.7) blur(10px) !important;
}
.youtube-music-header {
    padding: 20px;
}

.background-image::after {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #24c6dc; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #514a9d,
    #24c6dc
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #514a9d,
    #24c6dc
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  opacity: 0.4;
  content: "";
}
</style>
