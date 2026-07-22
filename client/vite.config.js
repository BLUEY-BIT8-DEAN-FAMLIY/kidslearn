import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// VITE_SINGLEFILE=1 inlines all JS/CSS into a single index.html so the
// offline desktop build runs by double-clicking the file (works from file://).
const SINGLEFILE = process.env.VITE_SINGLEFILE === '1'

export default defineConfig({
  plugins: [react(), ...(SINGLEFILE ? [viteSingleFile()] : [])],
  server: {
    open: false,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
