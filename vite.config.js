import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
  nodePolyfills({
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
    protocolImports: true,
  }),
  ],
  resolve: {
    alias: {
      // Ensure 'events' is resolved to the browser-compatible version
      events: 'events',
      // Ensure 'browser-level' and its dependencies are resolved correctly
      'browser-level': 'browser-level'
    },
  },
  optimizeDeps: {
    // Include dependencies in the bundle
    include: ['browser-level', 'events'],
    // Prevent externalization of critical dependencies
    exclude: ['events'],
  },
})
