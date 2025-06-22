import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import vueDevTools from 'vite-plugin-vue-devtools'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true, // Para acceder desde otros dispositivos en la red local
    open: true, // Abrir automáticamente en el navegador
    cors: true,
    
    // Proxy para desarrollo (opcional - si quieres proxear el backend)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Configuración de build
  build: {
    outDir: 'dist',
    sourcemap: true, // Para debugging en producción
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['axios']
        }
      }
    }
  },
  
  // Variables de entorno
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  
  // CSS
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Si decides usar SCSS en el futuro
      scss: {
        additionalData: `@import "@/assets/css/variables.scss";`
      }
    }
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'vue',
      'vue-router', 
      'pinia',
      'axios'
    ]
  }
})