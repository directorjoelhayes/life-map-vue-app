import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createRouter, createWebHistory } from 'vue-router' 
import { createPinia } from 'pinia'
import Home from './pages/home/home.vue'
import About from './pages/about/about.vue'
import HistoryDatabaseTest from './components/history-database-test/history-database.vue'
import Settings from './pages/settings/settings.vue'
import Apps from './pages/apps/apps.vue'
import { ViewTransitionsPlugin, startViewTransition } from 'vue-view-transitions'
import AppSingle from './pages/apps/app-single.vue'
import AppOverview from './pages/apps/tabs/app-overview.vue'
import AppHistory from './pages/apps/tabs/app-history.vue'
import AppSettings from './pages/apps/tabs/app-settings.vue'
import Search from './pages/search/search.vue'
import InfiniteCanvas from './pages/infinite-canvas/infinite-canvas.vue'
import Table from './pages/table/table.vue'
import VueVirtualScroller from 'vue-virtual-scroller'

// Global component imports
import LmCard from './components/cards/card.vue'
import LmContainer from './components/container/lm-container.vue'
import Row from './components/container/row.vue'
import Col from './components/container/col.vue'

import { ripple } from './v-ripple-directive'


const router = createRouter({   
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/apps', component: Apps },
    { path: '/infinite-canvas', component: InfiniteCanvas },
    { path: '/history-database-test', component: HistoryDatabaseTest },
    { path: '/settings', component: Settings },
    { path: '/table', component: Table },
    { 
      path: '/apps/:id', 
      component: AppSingle,
      children: [
        { path: '', redirect: 'overview' },
        { path: 'overview', component: AppOverview },
        { path: 'history', component: AppHistory },
        { path: 'settings', component: AppSettings }
      ]
    },
    { path: '/search', component: Search },
  ],
})

// Set up view transitions for router navigation
router.beforeResolve(async (to, from) => {
  // Only apply view transitions if the browser supports it
  if (!document.startViewTransition) {
    return
  }

  const viewTransition = startViewTransition(async () => {
    // The actual route change will happen here
    await new Promise(resolve => {
      // Give router time to update
      setTimeout(resolve, 0)
    })
  })
  
  await viewTransition.captured
})

const pinia = createPinia()

// Create app and use router before mounting
const app = createApp(App)

app.use(VueVirtualScroller)

app.directive('ripple', ripple)

// Register global components
app.component('LmCard', LmCard)
app.component('LmContainer', LmContainer)
app.component('Row', Row)
app.component('Col', Col)

app.use(ViewTransitionsPlugin())
app.use(router)
app.use(pinia)
app.mount('#app')
