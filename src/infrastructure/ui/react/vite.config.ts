import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Important for Electron: Set the base to './' for relative paths in build
  base: './',
  build: {
    outDir: 'dist', // Output directory for the build
  }
})
