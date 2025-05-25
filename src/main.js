import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createRouter, createWebHistory } from 'vue-router' 
import Home from './pages/home/home.vue'
import About from './pages/about/about.vue'

const router = createRouter({   
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
})

// Create app and use router before mounting
const app = createApp(App)
app.use(router)
app.mount('#app')
