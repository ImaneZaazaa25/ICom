import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import InactiveProducts from '../InactiveProducts'

// =========================
// MOCKS GLOBAL
// =========================
const mockUseInactiveProducts = vi.fn()

vi.mock('../../../hooks/useInactiveProducts', () => ({
  default: () => mockUseInactiveProducts()
}))

vi.mock('../../../hooks/useFilters', () => ({
  default: () => ({
    filters: {},
    updateFilter: vi.fn(),
    resetFilters: vi.fn()
  })
}))

vi.mock('../../../hooks/useCategories', () => ({
  default: () => []
}))

vi.mock('../../../utils/filterProducts', () => ({
  filterProducts: (products) => products
}))

vi.mock('../../../api/adminApi', () => ({
  updateProduct: vi.fn()
}))

// =========================

describe('InactiveProducts page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les produits inactifs', () => {

    mockUseInactiveProducts.mockReturnValue({
      products: [
        { id: 1, nom: 'Chaussures', prix: 59.99 },
        { id: 2, nom: 'Veste', prix: 89.99 }
      ],
      loading: false,
      error: null,
      refreshProducts: vi.fn()
    })

    render(
      <BrowserRouter>
        <InactiveProducts />
      </BrowserRouter>
    )

    expect(screen.getByText('Produits Inactifs')).toBeInTheDocument()
    expect(screen.getByText('Chaussures')).toBeInTheDocument()
    expect(screen.getByText('Veste')).toBeInTheDocument()
  })

  it('affiche loading si chargement', () => {

    mockUseInactiveProducts.mockReturnValue({
      products: [],
      loading: true,
      error: null,
      refreshProducts: vi.fn()
    })

    render(
      <BrowserRouter>
        <InactiveProducts />
      </BrowserRouter>
    )

    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('affiche erreur si API fail', () => {

    mockUseInactiveProducts.mockReturnValue({
      products: [],
      loading: false,
      error: new Error('API Error'),
      refreshProducts: vi.fn()
    })

    render(
      <BrowserRouter>
        <InactiveProducts />
      </BrowserRouter>
    )

    expect(screen.getByText(/Erreur/i)).toBeInTheDocument()
  })
})