import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import useCart from '../useCart'

// ✅ Le mock doit être déclaré avant l'import du module mocké.
// Vitest hisse automatiquement vi.mock() en haut, donc cet ordre fonctionne.
vi.mock('../../context/CartContext', () => {
  const ctx = React.createContext(null)
  return { CartContext: ctx }
})

// ✅ Import statique — remplace tous les require() qui causaient
//    "Cannot use import statement outside a module"
import { CartContext as MockCartContext } from '../../context/CartContext'

// ─── valeur par défaut réutilisable ─────────────────────────────────────────

const defaultCartValue = {
  cartItems: [],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  clearCart: vi.fn(),
  updateQuantity: vi.fn(),
  total: 0,
  cartCount: 0,
  validerPanier: vi.fn(),
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('useCart', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne le contexte panier fourni par CartContext', () => {
    const fakeCart = {
      cartItems: [{ id: 1, nom: 'Produit A', quantite: 2, prix: 10 }],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
      updateQuantity: vi.fn(),
      total: 20,
      cartCount: 2,
      validerPanier: vi.fn(),
    }

    const wrapper = ({ children }) => (
      <MockCartContext.Provider value={fakeCart}>{children}</MockCartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].id).toBe(1)
    expect(result.current.total).toBe(20)
    expect(result.current.cartCount).toBe(2)
  })

  it('expose addToCart, removeFromCart, clearCart, updateQuantity, validerPanier', () => {
    const fakeCart = {
      cartItems: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
      updateQuantity: vi.fn(),
      total: 0,
      cartCount: 0,
      validerPanier: vi.fn(),
    }

    const wrapper = ({ children }) => (
      <MockCartContext.Provider value={fakeCart}>{children}</MockCartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(typeof result.current.addToCart).toBe('function')
    expect(typeof result.current.removeFromCart).toBe('function')
    expect(typeof result.current.clearCart).toBe('function')
    expect(typeof result.current.updateQuantity).toBe('function')
    expect(typeof result.current.validerPanier).toBe('function')
  })

  it('retourne null quand utilisé hors CartContext (pas de Provider)', () => {
    // Sans Provider, useContext retourne la valeur par défaut du createContext (null)
    const { result } = renderHook(() => useCart())
    expect(result.current).toBeNull()
  })

  it('cartItems vide par défaut quand panier est vide', () => {
    const emptyCart = {
      cartItems: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
      updateQuantity: vi.fn(),
      total: 0,
      cartCount: 0,
      validerPanier: vi.fn(),
    }

    const wrapper = ({ children }) => (
      <MockCartContext.Provider value={emptyCart}>{children}</MockCartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.cartCount).toBe(0)
  })

  it('addToCart peut être appelé avec un produit', () => {
    const addToCart = vi.fn()

    const wrapper = ({ children }) => (
      <MockCartContext.Provider value={{ ...defaultCartValue, addToCart }}>
        {children}
      </MockCartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart({ id: 42, nom: 'Test', prix: 9.99 })
    })

    expect(addToCart).toHaveBeenCalledWith({ id: 42, nom: 'Test', prix: 9.99 })
  })

  it('removeFromCart peut être appelé avec un id produit', () => {
    const removeFromCart = vi.fn()

    const wrapper = ({ children }) => (
      <MockCartContext.Provider value={{ ...defaultCartValue, removeFromCart }}>
        {children}
      </MockCartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.removeFromCart(42)
    })

    expect(removeFromCart).toHaveBeenCalledWith(42)
  })

  it('updateQuantity peut être appelé avec id et nouvelle quantité', () => {
    const updateQuantity = vi.fn()

    const wrapper = ({ children }) => (
      <MockCartContext.Provider value={{ ...defaultCartValue, updateQuantity }}>
        {children}
      </MockCartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.updateQuantity(1, 5)
    })

    expect(updateQuantity).toHaveBeenCalledWith(1, 5)
  })

  it('clearCart vide le panier quand appelé', () => {
    const clearCart = vi.fn()

    const wrapper = ({ children }) => (
      <MockCartContext.Provider value={{ ...defaultCartValue, clearCart }}>
        {children}
      </MockCartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.clearCart()
    })

    expect(clearCart).toHaveBeenCalled()
  })
})