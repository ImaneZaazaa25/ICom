import React from "react";
import ProductCard from "./ProductCard";
import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";

const ProductGrid = ({ products, loading, error }) => {
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error.message || "Erreur lors du chargement des produits"} />;

  if (!products || products.length === 0) {
    return <p className="no-products">Aucun produit trouvé.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
