import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
  provider: 'v8',
  reporter: ['lcov', 'text', 'html'],
  include: [
    'src/components/common/**/*.{js,jsx}',
    'src/components/layout/**/*.{js,jsx}',
    'src/components/product/**/*.{js,jsx}',
    'src/context/CartContext.jsx',
    'src/hooks/useCart.js',
    'src/hooks/useCarousel.js',
    'src/hooks/useCategories.js',
    'src/hooks/useFilters.js',
    'src/hooks/useProducts.js',
    'src/pages/Cart/**/*.{js,jsx}',
    'src/pages/Home/**/*.{js,jsx}',
    'src/pages/Login/**/*.{js,jsx}',
    'src/pages/Orders/**/*.{js,jsx}',
    'src/pages/ProductDetails/**/*.{js,jsx}',
    'src/pages/Products/**/*.{js,jsx}',
    'src/pages/Profile/**/*.{js,jsx}',
    'src/pages/Register/**/*.{js,jsx}',
    'src/utils/filterProducts.js',
    'src/utils/formatPrice.js',
    'src/pages/Admin/**/*.{js,jsx}',
  ],
  exclude: [],
},
  },
})
