import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Cart from '../Cart'

// Les vi.fn() sont déclarés DANS la factory pour éviter le hoisting,
// mais stockés dans un objet partagé pour que les tests puissent les espionner.
const cartContextMock = {
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
}

vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({
    cartItems: [
      { id: 1, nom: 'Chaussures', prix: 59.99, quantite: 2, stock: 10 },
    ],
    total: 119.98,
    removeFromCart: cartContextMock.removeFromCart,
    updateQuantity: cartContextMock.updateQuantity,
    clearCart: cartContextMock.clearCart,
  }),
}))

vi.mock('../../../api/cartApi', () => ({
  ajouterAuPanier: vi.fn().mockResolvedValue({}),
  validerPanier: vi.fn().mockResolvedValue({}),
}))

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => vi.fn(),
}))

import * as cartApi from '../../../api/cartApi'

beforeEach(() => {
  localStorage.setItem('token', 'fake-token')
  vi.clearAllMocks()
  cartApi.ajouterAuPanier.mockResolvedValue({})
  cartApi.validerPanier.mockResolvedValue({})
})

describe('Cart — page client', () => {

  it('Cart — affichage : article du panier visible', () => {
    // ARRANGE
    render(<MemoryRouter><Cart /></MemoryRouter>)
    // ASSERT
    expect(screen.getByText('Chaussures')).toBeInTheDocument()
  })

  it('Cart — ids Selenium : conteneur et bouton valider présents', () => {
    // ARRANGE
    render(<MemoryRouter><Cart /></MemoryRouter>)
    // ASSERT
    expect(document.getElementById('cart-container')).toBeInTheDocument()
    expect(document.getElementById('cart-validate-btn')).toBeInTheDocument()
  })

  it('Cart — total : affiché correctement', () => {
    // ARRANGE
    render(<MemoryRouter><Cart /></MemoryRouter>)
    // ASSERT
    expect(document.getElementById('cart-total-price')).toHaveTextContent('119,98')
  })

  it('Cart — suppression : removeFromCart appelé avec le bon id', () => {
    // ARRANGE
    render(<MemoryRouter><Cart /></MemoryRouter>)
    // ACT
    fireEvent.click(document.getElementById('cart-item-remove-btn-1'))
    // ASSERT
    expect(cartContextMock.removeFromCart).toHaveBeenCalledWith(1)
  })

  it('Cart — valider : ajouterAuPanier et validerPanier appelés au clic', async () => {
    // ARRANGE
    render(<MemoryRouter><Cart /></MemoryRouter>)
    // ACT
    fireEvent.click(document.getElementById('cart-validate-btn'))
    // ASSERT
    await waitFor(() => {
      expect(cartApi.ajouterAuPanier).toHaveBeenCalledWith(1, 2)
      expect(cartApi.validerPanier).toHaveBeenCalledTimes(1)
    })
  })

})