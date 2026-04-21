// src/__tests__/pages/admin/HomeAdmin.test.jsx
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomeAdmin from '../../../pages/admin/HomeAdmin'

const updateProductMock = vi.fn()
const deleteProductMock = vi.fn()
const refreshProductsMock = vi.fn()

let mockProducts = [
  { id: 1, nom: 'Produit Actif 1', description: 'Description 1', prix: 100, quantite: 10, statut: true, categorie: { id: 1, nom: 'Électronique' } },
  { id: 2, nom: 'Produit Actif 2', description: 'Description 2', prix: 50, quantite: 5, statut: true, categorie: { id: 2, nom: 'Bureautique' } },
  { id: 3, nom: 'Produit Inactif', description: 'Description 3', prix: 200, quantite: 0, statut: false, categorie: { id: 1, nom: 'Électronique' } }
]

vi.mock('../../../hooks/useProducts', () => ({
  default: () => ({
    products: mockProducts,
    loading: false,
    error: null,
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
  updateProduct: (...args) => updateProductMock(...args),
  deleteProduct: (...args) => deleteProductMock(...args),
  createProduct: vi.fn()
}))

vi.mock('../../../components/admin/AdminProductCard', () => ({
  default: ({ product, onEdit, onDelete, onToggleStatus }) => (
    <div data-testid={`product-card-${product.id}`}>
      <span data-testid={`product-name-${product.id}`}>{product.nom}</span>
      <button data-testid={`edit-btn-${product.id}`} onClick={() => onEdit(product)}>Modifier</button>
      <button data-testid={`delete-btn-${product.id}`} onClick={() => onDelete(product.id)}>Supprimer</button>
      <button data-testid={`toggle-status-${product.id}`} onClick={() => onToggleStatus(product.id, !product.statut)}>
        {product.statut ? 'Désactiver' : 'Activer'}
      </button>
    </div>
  )
}))

vi.mock('../../../components/product/ProductFilters', () => ({
  default: () => <div data-testid="product-filters">Filtres</div>
}))

vi.mock('../../../components/admin/ProductModal', () => ({
  default: ({ isOpen, onClose, onSubmit, product }) => (
    isOpen ? (
      <div data-testid="product-modal">
        <span>{product ? 'Modifier' : 'Ajouter'} un produit</span>
        <button data-testid="modal-submit" onClick={onSubmit}>Valider</button>
        <button data-testid="modal-close" onClick={onClose}>Fermer</button>
      </div>
    ) : null
  )
}))

describe('HomeAdmin — page administration produits actifs', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    refreshProductsMock.mockResolvedValue()
    updateProductMock.mockResolvedValue({})
    deleteProductMock.mockResolvedValue({})
    window.confirm = vi.fn(() => true)
    window.alert = vi.fn()
  })

  it('affiche uniquement les produits actifs', () => {
    render(<MemoryRouter><HomeAdmin /></MemoryRouter>)
    expect(screen.getByTestId('product-name-1')).toHaveTextContent('Produit Actif 1')
    expect(screen.getByTestId('product-name-2')).toHaveTextContent('Produit Actif 2')
    expect(screen.queryByTestId('product-name-3')).not.toBeInTheDocument()
  })

  it('contient les IDs Selenium requis', () => {
    render(<MemoryRouter><HomeAdmin /></MemoryRouter>)
    expect(document.getElementById('admin-products-page')).toBeInTheDocument()
    expect(document.getElementById('admin-title')).toBeInTheDocument()
    expect(document.getElementById('add-product-btn')).toBeInTheDocument()
    expect(document.getElementById('products-stats')).toBeInTheDocument()
    expect(document.getElementById('admin-products-grid')).toBeInTheDocument()
  })

  it('affiche le bon nombre de produits actifs', () => {
    render(<MemoryRouter><HomeAdmin /></MemoryRouter>)
    expect(document.getElementById('products-stats')).toHaveTextContent('2 produit(s) actif(s) trouvé(s)')
  })

  it('appelle updateProduct lors de la désactivation', async () => {
    render(<MemoryRouter><HomeAdmin /></MemoryRouter>)
    fireEvent.click(screen.getByTestId('toggle-status-1'))
    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalled()
    })
  })

  it('appelle deleteProduct lors de la suppression', async () => {
    render(<MemoryRouter><HomeAdmin /></MemoryRouter>)
    fireEvent.click(screen.getByTestId('delete-btn-1'))
    await waitFor(() => {
      expect(deleteProductMock).toHaveBeenCalledWith(1)
    })
  })

  it('ouvre le modal d\'ajout', () => {
    render(<MemoryRouter><HomeAdmin /></MemoryRouter>)
    fireEvent.click(document.getElementById('add-product-btn'))
    expect(screen.getByTestId('product-modal')).toBeInTheDocument()
    expect(screen.getByText('Ajouter un produit')).toBeInTheDocument()
  })

  it('ouvre le modal d\'édition', () => {
    render(<MemoryRouter><HomeAdmin /></MemoryRouter>)
    fireEvent.click(screen.getByTestId('edit-btn-1'))
    expect(screen.getByTestId('product-modal')).toBeInTheDocument()
    expect(screen.getByText('Modifier un produit')).toBeInTheDocument()
  })
})