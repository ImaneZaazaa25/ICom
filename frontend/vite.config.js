import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',

    exclude: [
      '**/node_modules/**',
      '**/tests/selenium/**'
    ],

   coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov', 'html'],

  all: false, // 🔥 IMPORTANT

  include: [
    'src/**/*.{js,jsx}'
  ],

  exclude: [
    '**/node_modules/**',
    '**/*.css',
    '**/tests/**',
    '**/__tests__/**',
    '**/setupTests.js',
    'src/main.jsx',
    'src/App.jsx'
  ],
},
  },
})