import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Cart from '../Cart'

import * as CartContext from '../../../context/CartContext'
import * as cartApi from '../../../api/cartApi'

// ✅ Mock the entire module so exports are writable vi.fn() stubs
vi.mock('../../../api/cartApi', () => ({
  ajouterAuPanier: vi.fn(),
  validerPanier: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.setItem('token', 'fake-token')
})

const mockCart = (override = {}) => {
  vi.spyOn(CartContext, 'useCart').mockReturnValue({
    cartItems: [],
    total: 0,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    ...override,
  })
}

describe('Cart — fixed tests', () => {

  it('affiche panier avec article', () => {
    mockCart({
      cartItems: [
        { id: 1, nom: 'Chaussures', prix: 59.99, quantite: 2, stock: 10 },
      ],
      total: 119.98,
    })

    render(<MemoryRouter><Cart /></MemoryRouter>)
    expect(screen.getByText('Chaussures')).toBeInTheDocument()
  })

  it('redirige si pas de token', async () => {
    localStorage.removeItem('token')
    mockCart()

    render(<MemoryRouter><Cart /></MemoryRouter>)

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login')
    })
  })

  it('affiche panier vide', () => {
    mockCart()

    render(<MemoryRouter><Cart /></MemoryRouter>)
    expect(screen.getByText('Votre panier est vide.')).toBeInTheDocument()
  })

  it('supprime un article', () => {
    const removeMock = vi.fn()

    mockCart({
      cartItems: [{ id: 1, nom: 'Chaussures', prix: 59.99, quantite: 2 }],
      removeFromCart: removeMock,
    })

    render(<MemoryRouter><Cart /></MemoryRouter>)
    fireEvent.click(screen.getByLabelText("Supprimer l'article"))

    expect(removeMock).toHaveBeenCalledWith(1)
  })

  it('checkout success', async () => {
    const clearMock = vi.fn()

    mockCart({
      cartItems: [{ id: 1, nom: 'Chaussures', prix: 59.99, quantite: 2 }],
      total: 119.98,
      clearCart: clearMock,
    })

    // ✅ Control behavior via .mockResolvedValue — no reassignment needed
    cartApi.ajouterAuPanier.mockResolvedValue({})
    cartApi.validerPanier.mockResolvedValue({})

    render(<MemoryRouter><Cart /></MemoryRouter>)
    fireEvent.click(screen.getByText('Passer la commande'))

    await waitFor(() => {
      expect(cartApi.ajouterAuPanier).toHaveBeenCalled()
      expect(cartApi.validerPanier).toHaveBeenCalled()
      expect(clearMock).toHaveBeenCalled()
    })
  })

  it('vide le panier', () => {
    const clearMock = vi.fn()

    mockCart({
      cartItems: [{ id: 1 }],
      clearCart: clearMock,
    })

    render(<MemoryRouter><Cart /></MemoryRouter>)
    fireEvent.click(screen.getByText('Vider le panier'))

    expect(clearMock).toHaveBeenCalled()
  })

  it('modifie quantité', () => {
    const updateMock = vi.fn()

    mockCart({
      cartItems: [{ id: 1 }],
      updateQuantity: updateMock,
    })

    render(<MemoryRouter><Cart /></MemoryRouter>)
    fireEvent.click(screen.getByLabelText('Augmenter la quantité'))

    expect(updateMock).toHaveBeenCalled()
  })

})