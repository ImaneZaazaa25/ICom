import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProducts } from '../useProducts'
import * as productApi from '../../api/productApi'

vi.mock('../../api/productApi')

describe('useProducts', () => {

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('useProducts — état initial : loading=true et products=[]', async () => {
    // ARRANGE
    vi.mocked(productApi.getAllProducts).mockResolvedValue([])

    // ACT
    const { result } = renderHook(() => useProducts())

    // ASSERT — état synchrone avant résolution de la promesse
    expect(result.current.loading).toBe(true)
    expect(result.current.products).toEqual([])

    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('useProducts — succès API : loading=false et products contient les données', async () => {
    // ARRANGE
    const mockProducts = [
      { id: 1, nom: 'Chaussures', prix: 59.99 },
      { id: 2, nom: 'Veste', prix: 89.99 },
    ]

    vi.mocked(productApi.getAllProducts).mockResolvedValue(mockProducts)

    // ACT
    const { result } = renderHook(() => useProducts())

    // ASSERT
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.products).toEqual(mockProducts)
    expect(result.current.error).toBeNull()
  })

  it('useProducts — erreur API : loading=false et error non null', async () => {
    // ARRANGE
    vi.mocked(productApi.getAllProducts).mockRejectedValue(new Error('Erreur réseau'))

    // ACT
    const { result } = renderHook(() => useProducts())

    // ASSERT
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).not.toBeNull()
    expect(result.current.products).toEqual([])
  })

})