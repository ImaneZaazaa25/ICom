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
  const { filters, updateFilter, resetFilters } = useFilters();
  
  const categories = useCategories();

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  );

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
