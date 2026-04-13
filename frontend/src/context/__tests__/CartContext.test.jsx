import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCart } from '../CartContext'
import * as cartApi from '../../api/cartApi'
import CartProvider from "../CartProvider";
// vi.mock() = @Mock en Java
vi.mock('../../api/cartApi')

const PRODUIT = { id: 1, nom: 'Chaussures', prix: 59.99, stock: 10, actif: true }
const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

describe('CartContext — règles métier panier', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    // mockResolvedValue() = when().thenReturn() en Java
    cartApi.validerPanier.mockResolvedValue({ id: 50, etat: 'VALIDEE', total: 119.98 })
  })

  it('CartContext — état initial : panier vide', () => {
    // ARRANGE + ACT
    const { result } = renderHook(() => useCart(), { wrapper })
    // ASSERT
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('CartContext — addToCart cas nominal : produit ajouté avec la bonne quantité', () => {
    // ARRANGE
    const { result } = renderHook(() => useCart(), { wrapper })
    // ACT
    act(() => { result.current.addToCart(PRODUIT, 2) })
    // ASSERT
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantite).toBe(2)
  })

  it('CartContext — addToCart deux fois même produit : cumul des quantités', () => {
    // ARRANGE
    const { result } = renderHook(() => useCart(), { wrapper })
    // ACT
    act(() => { result.current.addToCart(PRODUIT, 2) })
    act(() => { result.current.addToCart(PRODUIT, 3) })
    // ASSERT — équivalent assertThat(item.quantite).isEqualTo(5)
    expect(result.current.cartItems[0].quantite).toBe(5)
  })

  it('CartContext — RÈGLE MÉTIER : quantité > stock bloquée au stock maximum', () => {
    // ARRANGE
    const { result } = renderHook(() => useCart(), { wrapper })
    // ACT — tente d'ajouter 15 alors que stock = 10
    act(() => { result.current.addToCart(PRODUIT, 15) })
    // ASSERT
    expect(result.current.cartItems[0].quantite).toBeLessThanOrEqual(10)
  })

  it('CartContext — RÈGLE MÉTIER : produit inactif rejeté, panier inchangé', () => {
    // ARRANGE
    const produitInactif = { ...PRODUIT, actif: false, nom: 'Veste' }
    const { result } = renderHook(() => useCart(), { wrapper })
    // ACT
    act(() => { result.current.addToCart(produitInactif, 1) })
    // ASSERT — équivalent assertThrows(ProduitInactifException.class)
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('CartContext — removeFromCart : produit retiré du panier', () => {
    // ARRANGE
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addToCart(PRODUIT, 1) })
    // ACT
    act(() => { result.current.removeFromCart(1) })
    // ASSERT
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('CartContext — clearCart : panier entièrement vidé', () => {
    // ARRANGE
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addToCart(PRODUIT, 2) })
    // ACT
    act(() => { result.current.clearCart() })
    // ASSERT
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('CartContext — total calculé : 2×59.99 + 1×19.99 = 139.97', () => {
    // ARRANGE
    const PRODUIT2 = { id: 2, nom: 'T-shirt', prix: 19.99, stock: 5, actif: true }
    const { result } = renderHook(() => useCart(), { wrapper })
    // ACT
    act(() => {
      result.current.addToCart(PRODUIT, 2)
      result.current.addToCart(PRODUIT2, 1)
    })
    // ASSERT
    expect(result.current.total).toBeCloseTo(139.97, 2)
  })

  it('CartContext — validerPanier panier vide : erreur, API jamais appelée', async () => {
    // ARRANGE — panier vide
    const { result } = renderHook(() => useCart(), { wrapper })
    // ACT + ASSERT — équivalent assertThrows(RuntimeException) + verify(never())
    await expect(result.current.validerPanier()).rejects.toThrow()
    expect(cartApi.validerPanier).not.toHaveBeenCalled()
  })

  it('CartContext — validerPanier succès : API appelée, panier vidé après', async () => {
    // ARRANGE
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addToCart(PRODUIT, 2) })
    // ACT
    await act(async () => { await result.current.validerPanier() })
    // ASSERT — équivalent verify(repo, times(1)) + panier vidé
    expect(cartApi.validerPanier).toHaveBeenCalledTimes(1)
    expect(result.current.cartItems).toHaveLength(0)
  })

})
