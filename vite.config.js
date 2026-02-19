import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// When running inside Docker the backend is reachable via the service name.
// Outside Docker (plain `npm run dev`) fall back to localhost.
const API_TARGET = process.env.VITE_API_PROXY_TARGET || 'http://localhost:4001'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  server: {
    host: '0.0.0.0',   // required so Docker can expose port 5173
    port: 5173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
