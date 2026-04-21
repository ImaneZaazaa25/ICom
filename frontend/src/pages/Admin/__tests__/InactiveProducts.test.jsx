// src/__tests__/pages/admin/InactiveProducts.test.jsx
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InactiveProducts from '../../../pages/admin/InactiveProducts'

// Mocks
const updateProductMock = vi.fn()
const refreshProductsMock = vi.fn()

// Mock useProducts avec une variable modifiable
let mockProducts = [
  {
    id: 1,
    nom: 'Clavier Inactif',
    description: 'Ancien clavier',
    prix: 15,
    quantite: 0,
    statut: false,
    categorie: { id: 2, nom: 'Bureautique' }
  },
  {
    id: 2,
    nom: 'Souris Inactive',
    description: 'Ancienne souris',
    prix: 10,
    quantite: 0,
    statut: false,
    categorie: { id: 2, nom: 'Bureautique' }
  },
  {
    id: 3,
    nom: 'Produit Actif',
    description: 'Produit actif',
    prix: 100,
    quantite: 5,
    statut: true,
    categorie: { id: 1, nom: 'Électronique' }
  }
]

let mockLoading = false
let mockError = null

vi.mock('../../../hooks/useProducts', () => ({
  default: () => ({
    products: mockProducts,
    loading: mockLoading,
    error: mockError,
    refreshProducts: refreshProductsMock
  })
}))

vi.mock('../../../hooks/useFilters', () => ({
  default: () => ({
    filters: { search: '', category: 'all', minPrice: null, maxPrice: null },
    updateFilter: vi.fn(),
    resetFilters: vi.fn()
  })
}))

vi.mock('../../../hooks/useCategories', () => ({
  default: () => [
    { id: 1, nom: 'Électronique' },
    { id: 2, nom: 'Bureautique' }
  ]
}))

vi.mock('../../../api/adminApi', () => ({
  updateProduct: (...args) => updateProductMock(...args)
}))

vi.mock('../../../components/admin/AdminProductCard', () => ({
  default: ({ product, onToggleStatus }) => (
    <div data-testid={`product-card-${product.id}`}>
      <span data-testid={`product-name-${product.id}`}>{product.nom}</span>
      <button
        data-testid={`toggle-btn-${product.id}`}
        onClick={() => onToggleStatus(product.id, true)}
      >
        Activer
      </button>
    </div>
  )
}))

vi.mock('../../../components/product/ProductFilters', () => ({
  default: () => <div data-testid="product-filters">Filtres</div>
}))

describe('InactiveProducts — page admin produits inactifs', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    refreshProductsMock.mockResolvedValue()
    updateProductMock.mockResolvedValue({})
    mockLoading = false
    mockError = null
    mockProducts = [
      {
        id: 1,
        nom: 'Clavier Inactif',
        description: 'Ancien clavier',
        prix: 15,
        quantite: 0,
        statut: false,
        categorie: { id: 2, nom: 'Bureautique' }
      },
      {
        id: 2,
        nom: 'Souris Inactive',
        description: 'Ancienne souris',
        prix: 10,
        quantite: 0,
        statut: false,
        categorie: { id: 2, nom: 'Bureautique' }
      },
      {
        id: 3,
        nom: 'Produit Actif',
        description: 'Produit actif',
        prix: 100,
        quantite: 5,
        statut: true,
        categorie: { id: 1, nom: 'Électronique' }
      }
    ]
  })

  it('affiche uniquement les produits inactifs', () => {
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    expect(screen.getByTestId('product-name-1')).toHaveTextContent('Clavier Inactif')
    expect(screen.getByTestId('product-name-2')).toHaveTextContent('Souris Inactive')
    expect(screen.queryByTestId('product-name-3')).not.toBeInTheDocument()
  })

  it('contient les IDs Selenium requis', () => {
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    expect(document.getElementById('inactive-products-page')).toBeInTheDocument()
    expect(document.getElementById('inactive-title')).toBeInTheDocument()
    expect(document.getElementById('inactive-filters-section')).toBeInTheDocument()
    expect(document.getElementById('inactive-products-stats')).toBeInTheDocument()
    expect(document.getElementById('inactive-products-grid')).toBeInTheDocument()
  })

  it('affiche le bon nombre de produits inactifs', () => {
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    const statsElement = document.getElementById('inactive-products-stats')
    expect(statsElement).toHaveTextContent('2 produit(s) inactif(s)')
  })

  it('appelle updateProduct lors de l\'activation', async () => {
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    fireEvent.click(screen.getByTestId('toggle-btn-1'))
    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalledWith(1, {
        nom: 'Clavier Inactif',
        description: 'Ancien clavier',
        prix: 15,
        quantite: 0,
        categorieId: 2,
        statut: true
      })
    })
  })

  it('appelle refreshProducts après activation', async () => {
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    fireEvent.click(screen.getByTestId('toggle-btn-2'))
    await waitFor(() => {
      expect(refreshProductsMock).toHaveBeenCalledTimes(1)
    })
  })

  it('affiche le message quand aucun produit inactif', () => {
    mockProducts = [
      { id: 3, nom: 'Produit Actif', statut: true }
    ]
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    expect(screen.getByText('Aucun produit inactif')).toBeInTheDocument()
  })

  it('affiche le spinner de chargement', () => {
    mockLoading = true
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('affiche le message d\'erreur', () => {
    mockError = { message: 'Erreur de chargement' }
    render(<MemoryRouter><InactiveProducts /></MemoryRouter>)
    expect(screen.getByText('Erreur: Erreur de chargement')).toBeInTheDocument()
  })
})