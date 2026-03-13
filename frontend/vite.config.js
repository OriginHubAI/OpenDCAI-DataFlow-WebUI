import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '')
    
    // Use localhost as default target if not specified
    const targetHost = '100.64.0.91'
    const backendPort = 8000
    const hfApiPort = env.VITE_HF_API_PORT || 8000

    return {
        base: './',
        plugins: [
            vue(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@/style/global.scss" as *;`
                }
            }
        },
        server: {
            proxy: {
                // Proxy for HF API, using separate port if provided
                '/api/hf': {
                    target: `http://${targetHost}:${hfApiPort}/`,
                    changeOrigin: true,
                    // We keep the /api/hf prefix because the backend router expects it
                    rewrite: path => path
                },
                // Default proxy for other API calls
                '/api': {
                    target: `http://${targetHost}:${backendPort}/`, // 后端 FastAPI 地址
                    changeOrigin: true,
                    // If the existing code was stripping /api, maybe it was intended for some reason.
                    // But backend routes show they expect /api prefix.
                    // To be safe and not break existing (somehow working) setup, we keep it as is.
                    rewrite: path => path.replace(/^\/api/, '')
                }
            }
        }
    }
})
