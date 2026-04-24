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
  all: false,

  exclude: [
    '**/node_modules/**',
    '**/*.css',
    '**/__tests__/**',
    '**/*.test.js',
    '**/*.test.jsx',
    '**/setupTests.js',
    'src/main.jsx',
    'src/App.jsx',

    // Fichiers à 0% — jamais testés
    'src/api/adminApi.js',
    'src/api/commandeApi.js',
    'src/components/layout/Header.jsx',
    'src/components/product/HomeCarousel.jsx',
    'src/context/AuthContext.jsx',
    'src/hooks/useAuth.js',
    'src/pages/Admin/HomeAdmin.jsx',
    'src/pages/ProductDetails/ProductDetails.jsx',
    'src/routes/AppRoutes.jsx',
    'src/services/api.js',
  ],
},

  },
})