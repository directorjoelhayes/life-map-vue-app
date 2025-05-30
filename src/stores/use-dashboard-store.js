// pinia store for dashboard
// Import browser-level correctly
// import { BrowserLevel } from 'browser-level'

import { defineStore } from 'pinia'

// console.log(BrowserLevel, "browser level")

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    db: new BrowserLevel('dashboard'),
  }),
  actions: {
    async getDashboard() {
      return this.db.get('dashboard')
    },
  },
})
