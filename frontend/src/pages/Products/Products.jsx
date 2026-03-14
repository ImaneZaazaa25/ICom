import React, { useState, useEffect, useMemo } from "react";
import useProducts from "../../hooks/useProducts";
import useFilters from "../../hooks/useFilters";
import { getAllCategories } from "../../api/categoryApi";
import ProductGrid from "../../components/product/ProductGrid";
import ProductFilters from "../../components/product/ProductFilters";
import "./Products.css";

const Products = () => {
  const { products, loading, error } = useProducts();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [categories, setCategories] = useState([]);

useEffect(() => {
  getAllCategories()
    .then((data) => {
      console.log("Categories:", data);
      setCategories(data);
    })
    .catch((err) => console.error("Erreur chargement catégories:", err));
}, []);
  const filteredProducts = useMemo(() => {
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
  }, [products, filters]);

  return (
    <div className="products-page">
      <h1>Nos Produits</h1>
      <ProductFilters
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        categories={categories}
      />
      <ProductGrid
        products={filteredProducts}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Products;
