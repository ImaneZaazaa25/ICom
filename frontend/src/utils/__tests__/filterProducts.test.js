import { describe, it, expect, beforeEach } from 'vitest'
import { filterProducts } from '../filterProducts'

describe('filterProducts', () => {

  let PRODUCTS

  beforeEach(() => {
    // ARRANGE — données partagées
    PRODUCTS = [
      { id: 1, nom: 'Chaussures Nike', categorie: { id: 1, nom: 'Sport' }, prix: 89.99, status: true },
      { id: 2, nom: 'Veste Zara',      categorie: { id: 2, nom: 'Mode' },  prix: 49.99, status: true },
      { id: 3, nom: 'Produit Inactif', categorie: { id: 1, nom: 'Sport' }, prix: 20,    status: false },
      { id: 4, nom: 'Casque Audio',    categorie: { id: 3, nom: 'Tech' },  prix: 150,   status: true },
    ]
  })

  it('filterProducts — aucun filtre : retourne uniquement les produits actifs', () => {
    // ACT
    const result = filterProducts(PRODUCTS, { search: '', categoryId: null, minPrice: null, maxPrice: null })
    // ASSERT
    expect(result).toHaveLength(3)
    expect(result.every(p => p.status)).toBe(true)
  })

  it('filterProducts — produit inactif : jamais retourné même sans filtre', () => {
    const result = filterProducts(PRODUCTS, {})
    expect(result.find(p => p.id === 3)).toBeUndefined()
  })

  it('filterProducts — recherche insensible à la casse : "nike" trouve Chaussures Nike', () => {
    // ACT
    const result = filterProducts(PRODUCTS, { search: 'nike' })
    // ASSERT
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filterProducts — recherche vide string : retourne tous les produits actifs', () => {
    const result = filterProducts(PRODUCTS, { search: '' })
    expect(result).toHaveLength(3)
  })

  it('filterProducts — filtre catégorie id=1 : retourne uniquement les actifs de cette catégorie', () => {
    // ACT
    const result = filterProducts(PRODUCTS, { categoryId: 1 })
    // ASSERT
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filterProducts — filtre prix min=50 max=100 : retourne les produits dans la fourchette', () => {
    const result = filterProducts(PRODUCTS, { minPrice: 50, maxPrice: 100 })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filterProducts — prix min=200 : retourne liste vide', () => {
    const result = filterProducts(PRODUCTS, { minPrice: 200 })
    expect(result).toHaveLength(0)
  })

  it('filterProducts — combinaison recherche + catégorie : intersection correcte', () => {
    const result = filterProducts(PRODUCTS, { search: 'chaussures', categoryId: 1 })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

})
