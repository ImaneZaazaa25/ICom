// src/components/admin/AdminProductCard.jsx
import React from 'react';
import ImageCarousel from '../product/ImageCarousel';
import { formatPrice } from "../../utils/formatPrice";
import './AdminProductCard.css';

const AdminProductCard = ({ product, onEdit, onDelete }) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.nom}" ?`)) {
      onDelete(product.id);
    }
  };

  const imageUrls = product.images?.map(img => `http://localhost:9091/uploads/${img.url}`) || [];

  // Tronquer la description si trop longue
  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="admin-product-card">
      {/* Bande de prix attirante */}
      <div className="price-ribbon">
        <span className="price-value">{formatPrice(product.prix)}</span>
      </div>

      <div className="product-card-image">
        {imageUrls.length > 1 ? (
          <ImageCarousel images={imageUrls} />
        ) : imageUrls.length === 1 ? (
          <img
            src={imageUrls[0]}
            alt={product.nom}
            className="product-card-img"
          />
        ) : (
          <div className="no-image">Pas d'image</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.nom}</h3>

        {/* Description */}
        {product.description && (
          <p className="product-description">
            {truncateDescription(product.description)}
          </p>
        )}

        {/* Catégorie */}
        {product.categorie && (
          <div className="product-category">
            {product.categorie.nom}
          </div>
        )}

        <div className="product-details">
          <span className="product-quantity">{product.quantite} en stock</span>
          <span className={`product-status ${product.statut ? 'active' : 'inactive'}`}>
            {product.statut ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>

      <div className="product-actions">
        <button className="edit-btn" onClick={handleEdit}>
          Modifier
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default AdminProductCard;