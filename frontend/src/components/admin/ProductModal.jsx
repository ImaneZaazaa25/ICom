// src/components/admin/ProductModal.jsx
import React, { useState, useEffect } from "react";
import "./ProductModal.css";
import axios from "axios";

const ProductModal = ({ isOpen, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    quantite: "",
    statut: true,
    categoryId: "",
    images: [],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nom: product.nom || "",
        description: product.description || "",
        prix: product.prix || "",
        quantite: product.quantite || "",
        statut: product.statut ?? true,
        categoryId: product.categorie?.id || "",
        images: [],
      });
    } else {
      setFormData({
        nom: "",
        description: "",
        prix: "",
        quantite: "",
        statut: true,
        categoryId: "",
        images: [],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nom.trim()) {
      alert("Le nom du produit est requis");
      return;
    }

    const prix = parseFloat(formData.prix);
    if (isNaN(prix) || prix <= 0) {
      alert("Le prix doit être un nombre positif");
      return;
    }

    const quantite = parseInt(formData.quantite);
    if (isNaN(quantite) || quantite < 0) {
      alert("La quantité doit être un nombre valide");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      let productId = product?.id;

      // 1️⃣ Créer ou modifier le produit
      if (productId) {
        // Modification
        await axios.put(
          `http://localhost:9091/api/produits/${productId}`,
          {
            nom: formData.nom,
            description: formData.description,
            prix: prix,
            quantite: quantite,
            statut: formData.statut,
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Création
        const res = await axios.post(
          "http://localhost:9091/api/produits",
          {
            nom: formData.nom,
            description: formData.description,
            prix: prix,
            quantite: quantite,
            statut: formData.statut,
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        productId = res.data.id;
      }

      // 2️⃣ Upload des images si présentes
      if (formData.images.length > 0) {
        const imageData = new FormData();
        formData.images.forEach((file) => imageData.append("files", file));

        await axios.post(
          `http://localhost:9091/api/images/upload/${productId}`,
          imageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("Produit enregistré avec succès !");
      onSubmit(); // Rafraîchir la liste
      onClose(); // Fermer le modal

    } catch (error) {
      console.error("Erreur:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Erreur: ${errorMsg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="product-modal-overlay">
      <div className="modal-content" id="product-modal-content">
        <div className="modal-header">
          <h2 id="product-modal-title">{product ? "Modifier le produit" : "Ajouter un produit"}</h2>
          <button className="close-btn" onClick={onClose} id="product-modal-close-btn">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} id="product-form">
          <div className="form-group">
            <label htmlFor="product-name-input">Nom *</label>
            <input
              type="text"
              name="nom"
              id="product-name-input"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-description-textarea">Description</label>
            <textarea
              name="description"
              id="product-description-textarea"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-price-input">Prix (MAD) *</label>
              <input
                type="number"
                name="prix"
                id="product-price-input"
                value={formData.prix}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-quantity-input">Quantité *</label>
              <input
                type="number"
                name="quantite"
                id="product-quantity-input"
                value={formData.quantite}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-category-select">Catégorie</label>
            <select
              name="categoryId"
              id="product-category-select"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label" htmlFor="product-status-checkbox">
              <input
                type="checkbox"
                name="statut"
                id="product-status-checkbox"
                checked={formData.statut}
                onChange={handleChange}
              />
              Produit actif
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="product-images-input">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              id="product-images-input"
              onChange={handleImageChange}
            />
            <div className="image-list" id="product-images-preview">
              {formData.images.map((file, index) => (
                <div key={index} className="image-item" id={`product-image-item-${index}`}>
                  <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    id={`product-image-remove-btn-${index}`}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              id="product-modal-cancel-btn"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-btn"
              id="product-modal-submit-btn"
            >
              {product ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;