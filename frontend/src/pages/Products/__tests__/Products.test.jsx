import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Products from '../Products'

vi.mock('../../../hooks/useProducts', () => ({
  default: () => ({ products: [], loading: false, error: null }),
  useProducts: () => ({ products: [], loading: false, error: null }),
}))

vi.mock('../../../hooks/useCategories', () => ({
  default: () => [],
  useCategories: () => [],
}))

vi.mock('../../../hooks/useFilters', () => ({
  default: () => ({
    searchTerm: '', categoryId: null, minPrice: null, maxPrice: null,
    setSearchTerm: vi.fn(), setCategoryId: vi.fn(),
    setMinPrice: vi.fn(), setMaxPrice: vi.fn(), resetFilters: vi.fn(),
  }),
  useFilters: () => ({
    searchTerm: '', categoryId: null, minPrice: null, maxPrice: null,
    setSearchTerm: vi.fn(), setCategoryId: vi.fn(),
    setMinPrice: vi.fn(), setMaxPrice: vi.fn(), resetFilters: vi.fn(),
  }),
}))

vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
  default: () => ({ user: null }),
}))

const renderProducts = () => render(<MemoryRouter><Products /></MemoryRouter>)

describe('Products — page', () => {

  it('Products — rendu : page rendue sans erreur', () => {
    // ARRANGE + ACT
    renderProducts()
    // ASSERT
    expect(screen.getByText(/Nos Produits/i)).toBeInTheDocument()
  })

  it('Products — filtre recherche : input id="filters-search-input" présent', () => {
    // ARRANGE + ACT
    renderProducts()
    // ASSERT
    expect(document.getElementById('filters-search-input')).toBeInTheDocument()
  })

  it('Products — liste vide : id="product-grid-empty-msg" présent quand aucun produit', () => {
    // ARRANGE + ACT
    renderProducts()
    // ASSERT
    expect(document.getElementById('product-grid-empty-msg')).toBeInTheDocument()
  })

})
