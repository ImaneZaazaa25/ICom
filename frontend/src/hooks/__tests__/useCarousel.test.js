import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCarousel } from '../useCarousel'

describe('useCarousel', () => {

  const IMAGES = ['img1.jpg', 'img2.jpg', 'img3.jpg']

  it('useCarousel — état initial : index = 0', () => {
    const { result } = renderHook(() => useCarousel(IMAGES))
    expect(result.current.index).toBe(0)
  })

  it('useCarousel — next() : index passe de 0 à 1', () => {
    const { result } = renderHook(() => useCarousel(IMAGES))
    act(() => { result.current.next() })
    expect(result.current.index).toBe(1)
  })

  it('useCarousel — next() en boucle : retourne à 0 après le dernier index', () => {
    const { result } = renderHook(() => useCarousel(IMAGES))
    act(() => { result.current.next() })
    act(() => { result.current.next() })
    act(() => { result.current.next() })
    expect(result.current.index).toBe(0)
  })

  it('useCarousel — prev() depuis index 0 : passe au dernier index', () => {
    const { result } = renderHook(() => useCarousel(IMAGES))
    act(() => { result.current.prev() })
    expect(result.current.index).toBe(2)
  })

  it('useCarousel — goTo(2) : index = 2', () => {
    const { result } = renderHook(() => useCarousel(IMAGES))
    act(() => { result.current.goTo(2) })
    expect(result.current.index).toBe(2)
  })

  it('useCarousel — images vides [] : index = 0, aucune erreur', () => {
    const { result } = renderHook(() => useCarousel([]))
    expect(result.current.index).toBe(0)
    expect(() => act(() => { result.current.next() })).not.toThrow()
  })

})
