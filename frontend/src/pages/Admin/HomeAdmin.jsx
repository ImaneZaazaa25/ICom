// src/pages/admin/HomeAdmin.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import useProducts from "../../hooks/useProducts";
import useFilters from "../../hooks/useFilters";
import { getAllCategories } from "../../api/categoryApi";
import { updateProduct, deleteProduct, createProduct } from "../../api/adminApi";
import AdminProductCard from "../../components/admin/AdminProductCard";
import ProductFilters from "../../components/product/ProductFilters";
import ProductModal from "../../components/admin/ProductModal";
import "./HomeAdmin.css";

const HomeAdmin = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        console.log("Categories:", data);
        setCategories(data);
      })
      .catch((err) => console.error("Erreur chargement catégories:", err));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchNom = product.nom
        .toLowerCase()
        .includes(filters.nom.toLowerCase());
      const matchCategorie =
        !filters.categorieId || product.categorie?.id === filters.categorieId;
      const matchPrixMin = product.prix >= filters.prixMin;
      const matchPrixMax = product.prix <= filters.prixMax;
      return matchNom && matchCategorie && matchPrixMin && matchPrixMax;
    });
  }, [products, filters]);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (productId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setActionLoading(true);
      try {
        await deleteProduct(productId);
        await refreshProducts();
        alert("Produit supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du produit");
      } finally {
        setActionLoading(false);
      }
    }
  }, [refreshProducts]);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(async (productData) => {
    setActionLoading(true);
    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, productData);
        alert("Produit modifié avec succès !");
      } else {
        // Create new product
        await createProduct(productData);
        alert("Produit ajouté avec succès !");
      }
      await refreshProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert("Erreur lors de l'enregistrement du produit");
    } finally {
      setActionLoading(false);
    }
  }, [editingProduct, refreshProducts]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  return (
    <div className="home-admin">
      <div className="admin-header">
        <h1>Administration des Produits</h1>
        <button className="add-product-btn" onClick={handleAddProduct}>
          + Ajouter un produit
        </button>
      </div>

      <ProductFilters
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        categories={categories}
      />

      {loading ? (
        <div className="loading-spinner">Chargement des produits...</div>
      ) : error ? (
        <div className="error-message">
          Erreur: {error.message || "Une erreur est survenue"}
        </div>
      ) : (
        <>
          <div className="products-stats">
            {filteredProducts.length} produit(s) trouvé(s)
          </div>
          <div className="admin-products-grid">
            {filteredProducts.map((product) => (
              <AdminProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="no-products">
              Aucun produit ne correspond à vos critères
            </div>
          )}
        </>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        product={editingProduct}
        categories={categories}
      />

      {actionLoading && (
        <div className="action-overlay">
          <div className="loading-spinner">Traitement en cours...</div>
        </div>
      )}
    </div>
  );
};

export default HomeAdmin;