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
            <div class="thumbnail-square">
              <div class="thumbnail-container">
                <!-- Low-res blurred placeholder -->
                <img
                  v-if="!highResThumbnailLoaded"
                  :src="numberOneVideo.snippet.thumbnails.default.url"
                  class="thumbnail-placeholder"
                  alt="Loading thumbnail"
                />
                <!-- High-res thumbnail -->
                <img
                  v-show="highResThumbnailLoaded"
                  :src="highResThumbnailUrl"
                  class="thumbnail-main"
                  @load="onHighResThumbnailLoad"
                  @error="onHighResThumbnailError"
                  alt="Video thumbnail"
                />
                <!-- Loading indicator -->
                <div v-if="!highResThumbnailLoaded" class="loading-overlay">
                  <div class="loading-spinner"></div>
                </div>
              </div>
            </div>
            <h2>{{ formatTitle(numberOneVideo.snippet.title) }}</h2>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const likedVideos = ref([]);
const numberOneVideo = ref(null);
const highResThumbnailUrl = ref("");
const highResThumbnailLoaded = ref(false);

const formatTitle = (title) => {
  return title.length > 50 ? title.substring(0, 50) + "..." : title;
};

const getHighResThumbnailUrl = (thumbnails) => {
  // Try to get the highest quality thumbnail available
  // YouTube provides: default (120x90), medium (320x180), high (480x360), standard (640x480), maxres (1280x720)
  if (thumbnails.maxres) return thumbnails.maxres.url;
  if (thumbnails.standard) return thumbnails.standard.url;
  if (thumbnails.high) return thumbnails.high.url;
  if (thumbnails.medium) return thumbnails.medium.url;
  return thumbnails.default.url; // fallback
};

const onHighResThumbnailLoad = () => {
  highResThumbnailLoaded.value = true;
};

const onHighResThumbnailError = () => {
  // If high-res fails to load, just mark as loaded to show the low-res version
  highResThumbnailLoaded.value = true;
};

const loadHighResThumbnail = (video) => {
  if (!video) return;
  
  highResThumbnailLoaded.value = false;
  highResThumbnailUrl.value = getHighResThumbnailUrl(video.snippet.thumbnails);
};

// Watch for changes in numberOneVideo to trigger high-res loading
watch(numberOneVideo, (newVideo) => {
  if (newVideo) {
    loadHighResThumbnail(newVideo);
  }
});

onMounted(async () => {
  const response = await axios.get(
    "http://localhost:3012/youtube-music/get-liked-videos"
  );

  console.log(response.data, "response");

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

.thumbnail-square {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
}

.thumbnail-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.thumbnail-placeholder,
.thumbnail-main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  filter: blur(2px);
  opacity: 0.8;
}

.thumbnail-main {
  transition: opacity 0.3s ease-in-out;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.thumbnail-square {
    height: 175px;
    width: 175px;
    box-shadow: 15px 15px 30px rgb(4 6 11 / 30%);
    border-style: solid;
    border-width: 1px;
    border-color: var(--surface-500)
}

.youtube-music-header-left-item {
    display: flex;
    flex-flow: column;
    align-items: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
