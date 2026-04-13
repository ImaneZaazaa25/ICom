import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductGrid from '../ProductGrid'

vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
  default: () => ({ user: null }),
}))

const renderGrid = (props) =>
  render(<MemoryRouter><ProductGrid {...props} /></MemoryRouter>)

describe('ProductGrid — composant', () => {

  it('ProductGrid — chargement : id="loader-spinner" affiché quand loading=true', () => {
    // ARRANGE + ACT
    renderGrid({ products: [], loading: true, error: null })
    // ASSERT
    expect(document.getElementById('loader-spinner')).toBeInTheDocument()
  })

  it('ProductGrid — erreur : message d\'erreur affiché quand error non null', () => {
    // ARRANGE + ACT
    renderGrid({ products: [], loading: false, error: new Error('Erreur réseau') })
    // ASSERT
    expect(screen.getByText(/Erreur réseau/i)).toBeInTheDocument()
  })

  it('ProductGrid — liste vide : id="product-grid-empty-msg" affiché', () => {
    // ARRANGE + ACT
    renderGrid({ products: [], loading: false, error: null })
    // ASSERT
    expect(document.getElementById('product-grid-empty-msg')).toBeInTheDocument()
  })

  it('ProductGrid — avec produits : product-grid-container présent et noms des produits visibles', () => {
    // ARRANGE
    const products = [
      { id: 1, nom: 'Chaussures', prix: 59.99, stock: 5, images: [], categorie: { nom: 'Sport' } },
      { id: 2, nom: 'Veste', prix: 89.99, stock: 3, images: [], categorie: { nom: 'Mode' } },
    ]
    // ACT
    renderGrid({ products, loading: false, error: null })
    // ASSERT
    expect(document.getElementById('product-grid-container')).toBeInTheDocument()
    expect(screen.getByText('Chaussures')).toBeInTheDocument()
    expect(screen.getByText('Veste')).toBeInTheDocument()
  })

})
