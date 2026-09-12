import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 路径别名：约定使用 @ 表示 src 目录（替代原 craco alias）
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 开发服务器代理（替代原 craco devServer.proxy）
  server: {
    proxy: {
      '/api': {
        target: 'https://geek.itheima.net/v1_0',
        changeOrigin: true,
        // 将请求路径中的 /api 前缀去除后转发到目标服务器
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
