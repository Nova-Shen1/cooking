import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/cooking/',  // 👈 加上这一行，cooking 是你的仓库名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
