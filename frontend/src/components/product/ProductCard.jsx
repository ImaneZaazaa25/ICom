import React from "react";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "./ImageCarousel";
import { formatPrice } from "../../utils/formatPrice";
import PropTypes from "prop-types";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <article
      id={`product-card-${product.id}`}
      className="product-card"
    >
      {/* Lien de navigation accessible — couvre toute la carte visuellement */}
      <button
        className="product-card-link"
        onClick={() => navigate(`/products/${product.id}`)}
        aria-label={`Voir le produit ${product.nom}`}
      >
        <div className="product-card-image">
          {product.images && product.images.length > 1 ? (
            <ImageCarousel
              id={`product-card-img-${product.id}`}
              images={product.images.map(
                (img) => `http://localhost:9091/uploads/${img.url}`
              )}
            />
          ) : (
            <img
              id={`product-card-img-${product.id}`}
              src={`http://localhost:9091/uploads/${product.images?.[0]?.url}`}
              alt={product.nom}
              className="product-card-img"
            />
          )}
        </div>

        <div className="product-card-info">
          <h3
            id={`product-card-title-${product.id}`}
            className="product-card-name"
          >
            {product.nom}
          </h3>
          <p className="product-card-category">
            {product.categorie?.nom}
          </p>
          <p
            id={`product-card-price-${product.id}`}
            className="product-card-price"
          >
            {formatPrice(product.prix)}
          </p>
        </div>
      </button>
    </article>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nom: PropTypes.string.isRequired,
    prix: PropTypes.number.isRequired,
    stock: PropTypes.number,
    actif: PropTypes.bool,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
      })
    ),
    categorie: PropTypes.shape({
      nom: PropTypes.string,
    }),
  }).isRequired,
};

export default ProductCard;