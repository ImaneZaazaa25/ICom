// src/components/admin/AdminProductCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageCarousel from '../product/ImageCarousel';
import { formatPrice } from "../../utils/formatPrice";
import './AdminProductCard.css';

const AdminProductCard = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  showEditDelete = true,
  showToggle = false,
  showStatus = true,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.nom}" ?`)) {
      onDelete(product.id);
    }
  };

  const handleToggleStatus = async (e) => {
    e.stopPropagation();
    const newStatus = !product.statut;
    const action = newStatus ? 'activer' : 'désactiver';

    if (window.confirm(`Êtes-vous sûr de vouloir ${action} le produit "${product.nom}" ?`)) {
      setIsToggling(true);
      try {
        await onToggleStatus(product.id, newStatus);
      } finally {
        setIsToggling(false);
      }
    }
  };

  const imageUrls = product.images?.map(img => `http://localhost:9091/uploads/${img.url}`) || [];

  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className={`admin-product-card ${variant === 'inactive' ? 'inactive-variant' : ''}`}
      onClick={handleCardClick}
      data-product-id={product.id}
      data-product-name={product.nom}
    >
      <div className="price-ribbon">
        <span
          id={`product-price-${product.id}`}
          className="price-value"
        >
          {formatPrice(product.prix)}
        </span>
      </div>

      <div
        id={`product-image-${product.id}`}
        className="product-card-image"
      >
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
        <h3
          id={`product-name-${product.id}`}
          className="product-name"
        >
          {product.nom}
        </h3>

        {product.description && (
          <p
            id={`product-desc-${product.id}`}
            className="product-description"
          >
            {truncateDescription(product.description)}
          </p>
        )}

        {product.categorie && (
          <div
            id={`product-category-${product.id}`}
            className="product-category"
          >
             {product.categorie.nom}
          </div>
        )}

        <div className="product-details">
          <span
            id={`product-quantity-${product.id}`}
            className="product-quantity"
          >
             {product.quantite} en stock
          </span>

          {showStatus && (
            <span
              id={`product-status-${product.id}`}
              className={`product-status ${product.statut ? 'active' : 'inactive'}`}
            >
              {product.statut ? ' Actif' : ' Inactif'}
            </span>
          )}
        </div>
      </div>

      <div className="product-actions">
        {/* Switch Toggle pour activation/désactivation */}
        {showToggle && (
          <div className="switch-container" onClick={(e) => e.stopPropagation()}>
            <label className="switch-label">
              <span className="switch-text">
                {product.statut ? 'Actif' : 'Inactif'}
              </span>
              <div className="switch-wrapper">
                <input
                  id={`switch-${product.id}`}
                  type="checkbox"
                  className="switch-input"
                  checked={product.statut}
                  onChange={handleToggleStatus}
                  disabled={isToggling}
                />
                <span className="switch-slider"></span>
              </div>
            </label>
          </div>
        )}

        {/* Boutons Modifier/Supprimer */}
        {showEditDelete && (
          <div className="action-buttons">
            <button
              id={`edit-product-${product.id}`}
              className="edit-btn"
              onClick={handleEdit}
            >
               Modifier
            </button>
            <button
              id={`delete-product-${product.id}`}
              className="delete-btn"
              onClick={handleDelete}
            >
               Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductCard;