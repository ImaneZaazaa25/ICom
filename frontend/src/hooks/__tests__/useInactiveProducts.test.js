import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useInactiveProducts from '../useInactiveProducts'
import * as productApi from '../../api/productApi'

// mock API
vi.mock('../../api/productApi')

const PRODUCTS_MOCK = [
  { id: 1, nom: 'Actif A', statut: true },
  { id: 2, nom: 'Inactif B', statut: false },
  { id: 3, nom: 'Actif C', statut: true },
  { id: 4, nom: 'Inactif D', statut: false },
]

describe('useInactiveProducts', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  // ─────────────────────────────────────────────
  // état initial
  // ─────────────────────────────────────────────

  it('commence avec loading=true, products=[], error=null', () => {
    productApi.getAllProducts.mockResolvedValue([])

    const { result } = renderHook(() => useInactiveProducts())

    expect(result.current.loading).toBe(true)
    expect(result.current.products).toEqual([])
    expect(result.current.error).toBeNull()
  })

  // ─────────────────────────────────────────────
  // cas normal
  // ─────────────────────────────────────────────

  it('filtre uniquement les produits inactifs (statut === false)', async () => {
    productApi.getAllProducts.mockResolvedValue(PRODUCTS_MOCK)

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(2)
    expect(result.current.products.every(p => p.statut === false)).toBe(true)
    expect(result.current.products.map(p => p.id)).toEqual([2, 4])
    expect(result.current.error).toBeNull()
  })

  it('retourne liste vide quand tous les produits sont actifs', async () => {
    productApi.getAllProducts.mockResolvedValue([
      { id: 1, statut: true },
      { id: 2, statut: true },
    ])

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(0)
  })

  it('retourne liste vide quand getAllProducts retourne []', async () => {
    productApi.getAllProducts.mockResolvedValue([])

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })

  // ─────────────────────────────────────────────
  // erreur API
  // ─────────────────────────────────────────────

  it('gère une erreur API : loading=false, products=[], error rempli', async () => {
    const err = new Error('API unavailable')
    productApi.getAllProducts.mockRejectedValue(err)

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual([])
    expect(result.current.error).toBe(err)
    expect(console.error).toHaveBeenCalled()
  })

  it('erreur : loading repasse bien à false (finally)', async () => {
    productApi.getAllProducts.mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.loading).toBe(false)
  })

  // ─────────────────────────────────────────────
  // refreshProducts (FIX STABLE)
  // ─────────────────────────────────────────────

  it('refreshProducts — recharge les produits', async () => {
    productApi.getAllProducts
      .mockResolvedValueOnce(PRODUCTS_MOCK)
      .mockResolvedValueOnce([{ id: 5, nom: 'Nouveau Inactif', statut: false }])

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(2)

    // refresh
    result.current.refreshProducts()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0].id).toBe(5)
    expect(productApi.getAllProducts).toHaveBeenCalledTimes(2)
  })

  it('refreshProducts — remet loading à true pendant le rechargement', async () => {
    let resolveFn

    productApi.getAllProducts
      .mockResolvedValueOnce([])
      .mockImplementationOnce(() => new Promise(res => { resolveFn = res }))

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    result.current.refreshProducts()

    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    resolveFn([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('refreshProducts — après une erreur, un refresh réussi reset error à null', async () => {
    productApi.getAllProducts
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce([{ id: 6, statut: false }])

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()

    result.current.refreshProducts()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.products).toHaveLength(1)
  })

  // ─────────────────────────────────────────────
  // logs
  // ─────────────────────────────────────────────

  it('log succès contient le nombre de produits inactifs', async () => {
    productApi.getAllProducts.mockResolvedValue(PRODUCTS_MOCK)

    const { result } = renderHook(() => useInactiveProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('2')
    )
  })
})