import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mkcert()
  ],
  base: "/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    https: true
  },
  proxy: {
      // proxy /api/exchange → Netlify function or local server
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
        secure: false
      }
    }
})
