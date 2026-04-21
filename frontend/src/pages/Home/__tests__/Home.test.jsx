import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../Home'

// Home utilise useProducts (default export) et ProductGrid qui utilise useCart/useAuth
vi.mock('../../../hooks/useProducts', () => ({
  default: () => ({ products: [], loading: false, error: null }),
}))

vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
  default: () => ({ user: null }),
}))

const renderHome = () => render(<MemoryRouter><Home /></MemoryRouter>)

describe('Home — page', () => {

  it('Home — rendu : page rendue sans erreur', () => {
    // ARRANGE + ACT
    const { container } = renderHome()
    // ASSERT — Home rend .home-page, pas de texte ICOM (pas de hero)
    expect(container.querySelector('.home-page')).toBeInTheDocument()
  })

  it('Home — rendu : section produits présente dans le DOM', () => {
    // ARRANGE + ACT
    renderHome()
    // ASSERT — ProductGrid rend #product-grid-empty-msg quand products=[]
    expect(document.getElementById('product-grid-empty-msg')).toBeInTheDocument()
  })

})