import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import useProducts from '../useProducts'

// =========================
// MOCK API
// =========================
const getActiveProductsMock = vi.fn()

vi.mock('../../api/productApi', () => ({
  getActiveProducts: () => getActiveProductsMock()
}))

describe('useProducts', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================
  it('succès API : loading=false et products contient les données', async () => {

    const mockProducts = [
      { id: 1, nom: 'Chaussures', prix: 59.99 },
      { id: 2, nom: 'Veste', prix: 89.99 }
    ]

    getActiveProductsMock.mockResolvedValue(mockProducts)

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual(mockProducts)
    expect(result.current.error).toBeNull()
  })

  // =========================
  it('erreur API : loading=false et error non null', async () => {

    getActiveProductsMock.mockRejectedValue(new Error('Erreur réseau'))

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
    expect(result.current.products).toEqual([])
  })
})