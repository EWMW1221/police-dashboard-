import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

function publicReportAssets() {
  return {
    name: 'public-report-assets',
    generateBundle() {
      const assets = [
        ['src/index.css', 'text/css', resolve(projectRoot, 'src/index.css')],
        ['src/App.css', 'text/css', resolve(projectRoot, 'src/App.css')],
        ['src/images 1.jpg', 'image/jpeg', resolve(projectRoot, 'src/images 1.jpg')],
      ]
      assets.forEach(([fileName, type, filePath]) => {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(filePath) })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), publicReportAssets()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/external-reports-api': {
        target: 'http://127.0.0.1:8001',
        rewrite: (path) => path.replace(/^\/external-reports-api/, ''),
      },
    },
  },
})
