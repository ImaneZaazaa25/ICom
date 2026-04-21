/**
 * Filtre une liste de produits selon les critères fournis.
 * Exclut toujours les produits inactifs (actif === false).
 * @param {Array} products - Liste complète des produits
 * @param {Object} filters - Critères : { search, categoryId, minPrice, maxPrice }
 * @returns {Array} Liste filtrée
 */
export const filterProducts = (products, filters = {}) => {
  const { search = "", categoryId = null, minPrice = null, maxPrice = null } = filters;

  return products.filter((product) => {
    if (product.status === false) return false;

    const matchSearch =
      !search ||
      product.nom.toLowerCase().includes(search.toLowerCase());

    const matchCategorie =
      !categoryId || product.categorie?.id === categoryId;

    const matchPrixMin = minPrice === null || product.prix >= minPrice;
    const matchPrixMax = maxPrice === null || product.prix <= maxPrice;

    return matchSearch && matchCategorie && matchPrixMin && matchPrixMax;
  });
};
