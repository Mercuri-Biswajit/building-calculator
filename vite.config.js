import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],   // Handles JSX, Fast Refresh
  server: {
    port: 3000,         // Same port as CRA default
    open: true,         // Auto-open browser
  },
  build: {
    outDir: 'build',    // Keep same output dir as CRA
  },
})