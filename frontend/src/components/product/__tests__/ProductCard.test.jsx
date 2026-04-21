import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from '../ProductCard'

// ProductCard n'utilise plus useCart ni useAuth — navigation uniquement
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}))

const PRODUCT = {
  id: 1,
  nom: 'Chaussures Nike',
  prix: 89.99,
  stock: 10,
  actif: true,
  images: [{ url: 'test.jpg' }],
  categorie: { nom: 'Shoes' },
}

const renderCard = (product = PRODUCT) =>
  render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>)

describe('ProductCard — composant', () => {

  beforeEach(() => { vi.clearAllMocks() })

  it('ProductCard — affichage : affiche le nom du produit', () => {
    // ARRANGE + ACT
    renderCard()
    // ASSERT
    expect(screen.getByText('Chaussures Nike')).toBeInTheDocument()
  })

  it('ProductCard — affichage : affiche le prix formaté', () => {
    // ARRANGE + ACT
    renderCard()
    // ASSERT
    expect(screen.getByText(/89,99/)).toBeInTheDocument()
  })

  it('ProductCard — ids Selenium : ids requis présents dans le DOM', () => {
    // ARRANGE + ACT
    renderCard()
    // ASSERT
    expect(document.getElementById('product-card-1')).toBeInTheDocument()
    expect(document.getElementById('product-card-title-1')).toBeInTheDocument()
    expect(document.getElementById('product-card-price-1')).toBeInTheDocument()
  })

  it('ProductCard — navigation : clic sur la carte navigue vers le détail', () => {
    // ARRANGE
    renderCard()
    // ACT
    fireEvent.click(document.getElementById('product-card-1').querySelector('button'))
    // ASSERT
    expect(mockNavigate).toHaveBeenCalledWith('/products/1')
  })

  it('ProductCard — image : id image présent dans le DOM', () => {
    // ARRANGE + ACT
    renderCard()
    // ASSERT
    expect(document.getElementById('product-card-img-1')).toBeInTheDocument()
  })

  it('ProductCard — catégorie : nom catégorie affiché', () => {
    // ARRANGE + ACT
    renderCard()
    // ASSERT
    expect(screen.getByText('Shoes')).toBeInTheDocument()
  })

})