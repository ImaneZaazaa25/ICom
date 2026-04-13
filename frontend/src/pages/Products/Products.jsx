import React, { useMemo } from "react";
import useProducts from "../../hooks/useProducts";
import useFilters from "../../hooks/useFilters";
import ProductGrid from "../../components/product/ProductGrid";
import ProductFilters from "../../components/product/ProductFilters";
import { filterProducts } from "../../utils/filterProducts";
import useCategories from "../../hooks/useCategories";
import "./Products.css";

const Products = () => {
  const { products, loading, error } = useProducts();
  const {
    searchTerm,
    categoryId,
    minPrice,
    maxPrice,
    setSearchTerm,
    setCategoryId,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  } = useFilters();

  const categories = useCategories();

  const filteredProducts = useMemo(
    () => filterProducts(products, { search: searchTerm, categoryId, minPrice, maxPrice }),
    [products, searchTerm, categoryId, minPrice, maxPrice]
  );

  return (
    <div className="products-page">
      <h1>Nos Produits</h1>
      <ProductFilters
        categories={categories}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryId}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onReset={resetFilters}
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
