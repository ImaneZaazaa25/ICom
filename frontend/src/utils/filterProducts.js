export const filterProducts = (products, filters) => {
  return products.filter((product) => {
    const matchNom = product.nom
      .toLowerCase()
      .includes(filters.nom.toLowerCase());

    const matchCategorie =
      !filters.categorieId || product.categorie?.id === filters.categorieId;

    const matchPrixMin = product.prix >= filters.prixMin;
    const matchPrixMax = product.prix <= filters.prixMax;

    return matchNom && matchCategorie && matchPrixMin && matchPrixMax;
  });
};