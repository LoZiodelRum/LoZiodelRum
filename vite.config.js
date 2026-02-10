import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // Questo permette all'app di trovare i file usando il simbolo @
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
    open: true
  }
});