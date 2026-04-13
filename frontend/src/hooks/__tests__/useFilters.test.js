import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilters } from '../useFilters'

describe('useFilters', () => {

  it('useFilters — état initial : tous les filtres à leur valeur vide', () => {
    // ARRANGE + ACT
    const { result } = renderHook(() => useFilters())
    // ASSERT
    expect(result.current.searchTerm).toBe('')
    expect(result.current.categoryId).toBeNull()
    expect(result.current.minPrice).toBeNull()
    expect(result.current.maxPrice).toBeNull()
  })

  it('useFilters — setSearchTerm : met à jour searchTerm', () => {
    const { result } = renderHook(() => useFilters())
    // ACT
    act(() => { result.current.setSearchTerm('nike') })
    // ASSERT
    expect(result.current.searchTerm).toBe('nike')
  })

  it('useFilters — setCategoryId : met à jour categoryId', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.setCategoryId(2) })
    expect(result.current.categoryId).toBe(2)
  })

  it('useFilters — setMinPrice et setMaxPrice : mis à jour indépendamment', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setMinPrice(50)
      result.current.setMaxPrice(100)
    })
    expect(result.current.minPrice).toBe(50)
    expect(result.current.maxPrice).toBe(100)
  })

  it('useFilters — resetFilters : remet tous les filtres à leur valeur initiale', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setSearchTerm('nike')
      result.current.setCategoryId(1)
      result.current.setMinPrice(50)
    })
    // ACT
    act(() => { result.current.resetFilters() })
    // ASSERT
    expect(result.current.searchTerm).toBe('')
    expect(result.current.categoryId).toBeNull()
    expect(result.current.minPrice).toBeNull()
  })

})
