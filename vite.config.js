import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/ListaProductosVue/',  // Asegúrate de cambiar este valor si tu repositorio tiene otro nombre
  build: {
    outDir: 'dist',  // Asegúrate de que la salida esté en dist
  }
})


