// src/pages/admin/HomeAdmin.jsx
import React, { useState, useMemo, useCallback } from "react";
import useProducts from "../../hooks/useProducts";
import useFilters from "../../hooks/useFilters";
import { updateProduct, deleteProduct, createProduct } from "../../api/adminApi";
import AdminProductCard from "../../components/admin/AdminProductCard";
import ProductFilters from "../../components/product/ProductFilters";
import ProductModal from "../../components/admin/ProductModal";
import { filterProducts } from "../../utils/filterProducts";
import useCategories from "../../hooks/useCategories";
import "./HomeAdmin.css";

const HomeAdmin = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const categories = useCategories();

  const activeProducts = useMemo(() => {
    const allProducts = filterProducts(products, filters);
    return allProducts.filter(product => product.statut === true);
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
        alert("✅ Produit supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("❌ Erreur lors de la suppression du produit");
      } finally {
        setActionLoading(false);
      }
    }
  }, [refreshProducts]);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(async () => {
    // Cette fonction est appelée après l'enregistrement dans le modal
    await refreshProducts();
    setIsModalOpen(false);
    setEditingProduct(null);
  }, [refreshProducts]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  const handleToggleStatus = useCallback(async (productId, newStatus) => {
    setActionLoading(true);
    try {
      const productToUpdate = activeProducts.find(p => p.id === productId);
      if (productToUpdate) {
        const updatedProduct = { ...productToUpdate, statut: newStatus };
        await updateProduct(productId, updatedProduct);
        await refreshProducts();
        alert(`✅ Produit ${newStatus ? 'activé' : 'désactivé'} avec succès !`);
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("❌ Erreur lors du changement de statut du produit");
    } finally {
      setActionLoading(false);
    }
  }, [activeProducts, refreshProducts]);

  return (
    <div className="home-admin" id="admin-products-page">
      <div className="admin-header">
        <h1 id="admin-title">Administration des Produits Actifs</h1>
        <button
          id="add-product-btn"
          className="add-product-btn"
          onClick={handleAddProduct}
        >
          + Ajouter un produit
        </button>
      </div>

      <div id="product-filters-section">
        <ProductFilters
          filters={filters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          categories={categories}
        />
      </div>

      {loading ? (
        <div id="loading-spinner" className="loading-spinner">Chargement des produits actifs...</div>
      ) : error ? (
        <div id="error-message" className="error-message">
          Erreur: {error.message || "Une erreur est survenue"}
        </div>
      ) : (
        <>
          <div id="products-stats" className="products-stats">
            {activeProducts.length} produit(s) actif(s) trouvé(s)
          </div>
          <div id="admin-products-grid" className="admin-products-grid">
            {activeProducts.map((product) => (
              <AdminProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                showEditDelete={true}
                showToggle={true}
                showStatus={true}
              />
            ))}
          </div>
          {activeProducts.length === 0 && (
            <div id="no-products-message" className="no-products">
              <div className="no-products-icon"></div>
              <h3>Aucun produit actif</h3>
              <p>Aucun produit actif ne correspond à vos critères</p>
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
        <div id="action-overlay" className="action-overlay">
          <div className="loading-spinner">Traitement en cours...</div>
        </div>
      )}
    </div>
  );
};

export default HomeAdmin;