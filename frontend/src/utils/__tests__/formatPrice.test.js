import { describe, it, expect } from 'vitest'
import { formatPrice } from '../formatPrice'

describe('formatPrice', () => {

  it('formatPrice — cas nominal : formate 19.9 avec deux décimales', () => {
    // ARRANGE
    const prix = 19.9
    // ACT
    const result = formatPrice(prix)
    // ASSERT
    expect(result).toBe('19,90\u00a0€')
  })

  it('formatPrice — zéro : retourne 0,00 €', () => {
    expect(formatPrice(0)).toBe('0,00\u00a0€')
  })

  it('formatPrice — milliers : ajoute le séparateur de milliers', () => {
    const result = formatPrice(1000)
    expect(result).toMatch(/1[\s\u00a0]000/)
  })

  it('formatPrice — arrondi : 19.999 arrondi correctement', () => {
    expect(formatPrice(19.999)).toBe('20,00\u00a0€')
  })

  it('formatPrice — null : ne lance pas d\'exception, retourne 0,00 €', () => {
    expect(() => formatPrice(null)).not.toThrow()
  })

  it('formatPrice — undefined : ne lance pas d\'exception', () => {
    expect(() => formatPrice(undefined)).not.toThrow()
  })

  it('formatPrice — string invalide : ne lance pas d\'exception', () => {
    expect(() => formatPrice('abc')).not.toThrow()
  })

})
