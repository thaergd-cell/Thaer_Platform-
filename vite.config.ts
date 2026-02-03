
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // استخدام '/' للمسار الجذري يمنع مشاكل تحميل الملفات في الصفحات الفرعية
  base: '/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      external: [
        // استثناء المكتبات التي يتم تحميلها عبر CDN لتقليل حجم البناء
        'xlsx', 
        '@google/genai'
      ],
      output: {
        manualChunks: undefined
      }
    }
  }
})
