import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',

    // ✅ IMPORTANT : exclure Selenium
    exclude: [
      '**/node_modules/**',
      '**/tests/selenium/**'
    ],

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
        'src/hooks/useAuth.js',
        'src/hooks/InactiveProducts.js',
        'src/pages/Cart/**/*.{js,jsx}',
        'src/pages/Home/**/*.{js,jsx}',
        'src/pages/Login/**/*.{js,jsx}',
        'src/pages/Orders/**/*.{js,jsx}',
        'src/pages/ProductDetails/**/*.{js,jsx}',
        'src/pages/Products/**/*.{js,jsx}',
        'src/pages/Profile/**/*.{js,jsx}',
        'src/pages/Register/**/*.{js,jsx}',
        'src/pages/Admin/**/*.{js,jsx}',
        'src/utils/filterProducts.js',
        'src/utils/formatPrice.js',
        'src/utils/loadImageWithAuth.js',
        'src/layout/Footer.jsx',
        'src/layout/Header.jsx',

      ],
      exclude: [],
    },
  },
})