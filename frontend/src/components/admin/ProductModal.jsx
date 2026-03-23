// src/components/admin/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import './ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    quantite: '',
    statut: true,
    categoryId: '',
    images: []
  });

  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        nom: product.nom || '',
        description: product.description || '',
        prix: product.prix || '',
        quantite: product.quantite || '',
        statut: product.statut !== undefined ? product.statut : true,
        categoryId: product.categorie?.id || '',
        images: product.images?.map(img => img.url) || []
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        prix: '',
        quantite: '',
        statut: true,
        categoryId: '',
        images: []
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      prix: parseFloat(formData.prix),
      quantite: parseInt(formData.quantite)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du produit *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prix (MAD) *</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Quantité *</label>
              <input
                type="number"
                name="quantite"
                value={formData.quantite}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="statut"
                checked={formData.statut}
                onChange={handleChange}
              />
              Produit actif
            </label>
          </div>

          <div className="form-group">
            <label>Images</label>
            <div className="image-input-group">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="URL de l'image"
              />
              <button type="button" onClick={handleAddImage}>
                Ajouter
              </button>
            </div>
            <div className="image-list">
              {formData.images.map((url, index) => (
                <div key={index} className="image-item">
                  <img src={url} alt={`Image ${index + 1}`} />
                  <button type="button" onClick={() => handleRemoveImage(index)}>
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              {product ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;