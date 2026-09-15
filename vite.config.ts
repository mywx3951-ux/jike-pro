import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 开发 / 预览共用的代理配置：把 /api 前缀去掉后转发到真实接口
const proxyConfig = {
    '/api': {
        target: 'https://geek.itheima.net/v1_0',
        changeOrigin: true,
        // 将请求路径中的 /api 前缀去除后转发到目标服务器
        rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 资源用相对路径引用：部署到任意子目录（如 GitHub Pages 项目页）都不会 404。
  // 注意生产环境需要服务器把所有路由 fallback 到 index.html，且 /api 要反向代理到接口
  base: './',
  // 路径别名：约定使用 @ 表示 src 目录（替代原 craco alias）
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 开发服务器代理（替代原 craco devServer.proxy）
  server: {
    proxy: proxyConfig,
  },
  // npm run preview 预览 dist 时也走同一份代理，
  // 否则打包产物一预览就因为 /api 401 / 404 没法验证
  preview: {
    proxy: proxyConfig,
  },
})
