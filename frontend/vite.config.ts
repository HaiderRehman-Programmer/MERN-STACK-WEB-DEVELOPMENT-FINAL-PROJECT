import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['axios', 'framer-motion', 'uuidv7'],
          'icons': ['lucide-react'],
        }
      }
    }
  }
})
