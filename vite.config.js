import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  // H5 开发服务器配置
  server: {
    port: 5173,
    proxy: {
      // 代理配置 - 仅 H5 开发时生效
      '/api': {
        target: 'http://43.142.75.179:83',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
