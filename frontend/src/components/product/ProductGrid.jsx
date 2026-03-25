import React from "react";
import ProductCard from "./ProductCard";
import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";
import PropTypes from "prop-types";

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
ProductGrid.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nom: PropTypes.string.isRequired,
    prix: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
    })),
    categorie: PropTypes.shape({
      nom: PropTypes.string.isRequired,
    }),
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object,
};
export default ProductGrid;