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
    images: [], // fichiers sélectionnés
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

  // Texte, checkbox, select
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Sélection de fichiers depuis l'ordi
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  // Supprimer un fichier sélectionné
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Soumission du produit
  const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");

        // ✅ Ajouter ici
        console.log("Token:", token);
        console.log("Images sélectionnées:", formData.images);

      try {
        // 1️⃣ Créer ou modifier le produit (JSON)
        const token = localStorage.getItem("token");
        let productId = product?.id;

        if (productId) {
          // Modifier
          await axios.put(
            `http://localhost:9091/api/produits/${productId}`,
            {
              nom: formData.nom,
              description: formData.description,
              prix: parseFloat(formData.prix),
              quantite: parseInt(formData.quantite),
              statut: formData.statut,
              categoryId: formData.categoryId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Créer
          const res = await axios.post(
            "http://localhost:9091/api/produits",
            {
              nom: formData.nom,
              description: formData.description,
              prix: parseFloat(formData.prix),
              quantite: parseInt(formData.quantite),
              statut: formData.statut,
              categoryId: formData.categoryId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          productId = res.data.id;
        }

        // 2️⃣ Upload images (si sélectionnées)
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
        onSubmit(); // rafraîchir la liste dans HomeAdmin
        onClose();
      } catch (error) {
        console.error(error);
      };
    };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? "Modifier le produit" : "Ajouter un produit"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nom */}
          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {/* Prix et quantité */}
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

          {/* Catégorie */}
          <div className="form-group">
            <label>Catégorie</label>
            <select
              name="categoryId"
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

          {/* Statut */}
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

          {/* Images */}
          <div className="form-group">
            <label>Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="image-list">
              {formData.images.map((file, index) => (
                <div key={index} className="image-item">
                  <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              {product ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;