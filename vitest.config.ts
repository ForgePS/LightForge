import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@libs': path.resolve(__dirname, 'src/libs'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@core': path.resolve(__dirname, 'src/@core'),
      '@configs': path.resolve(__dirname, 'src/configs')
    }
  }
})
