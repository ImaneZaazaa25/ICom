import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCategories } from '../useCategories'
import * as categoryApi from '../../api/categoryApi'

vi.mock('../../api/categoryApi')

describe('useCategories', () => {

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('useCategories — état initial : tableau vide avant résolution API', () => {
    // ARRANGE
    vi.mocked(categoryApi.getAllCategories).mockResolvedValue([])

    // ACT
    const { result } = renderHook(() => useCategories())

    // ASSERT — état synchrone initial
    expect(result.current).toEqual([])
  })

  it('useCategories — succès API : retourne la liste des catégories avec les bons noms', async () => {
    // ARRANGE
    const mockCategories = [
      { id: 1, nom: 'Sport' },
      { id: 2, nom: 'Mode' },
    ]

    vi.mocked(categoryApi.getAllCategories).mockResolvedValue(mockCategories)

    // ACT
    const { result } = renderHook(() => useCategories())

    // ASSERT
    await waitFor(() => expect(result.current).toEqual(mockCategories))

    expect(result.current[0].nom).toBe('Sport')
    expect(result.current[1].nom).toBe('Mode')
  })

})