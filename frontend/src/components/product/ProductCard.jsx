import React from "react";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "./ImageCarousel";
import { formatPrice } from "../../utils/formatPrice";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  // Affiche le produit complet dans la console
  console.log("Product data:", product);

  const handleClick = () => {
   
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-card-image">
        {product.images && product.images.length > 1 ? (
          <ImageCarousel  images={product.images.map(img => `http://localhost:9091/uploads/${img.url}`)} />
        ) 
      
        : (
          <img
         
            src= {`http://localhost:9091/uploads/${product.images?.[0]?.url}`}
            alt={product.nom}
            className="product-card-img"
          />
        )}
      </div>

      <div className="product-card-info">
       
        <h3 className="product-card-name">{product.nom}</h3>
        <p className="product-card-category">{product.categorie?.nom}</p>
        <p className="product-card-price">{formatPrice(product.prix)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
