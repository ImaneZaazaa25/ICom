// src/pages/admin/InactiveProducts.jsx (version avec header identique)
import React, { useState, useMemo, useCallback } from "react";
import useProducts from "../../hooks/useProducts";
import useFilters from "../../hooks/useFilters";
import { updateProduct } from "../../api/adminApi";
import AdminProductCard from "../../components/admin/AdminProductCard";
import ProductFilters from "../../components/product/ProductFilters";
import useCategories from "../../hooks/useCategories";
import "./HomeAdmin.css";

const InactiveProducts = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [actionLoading, setActionLoading] = useState(false);

  const categories = useCategories();

  // Filtrer uniquement les produits INACTIFS
  const inactiveProducts = useMemo(() => {
    return products.filter((product) => {
      const matchNom = product.nom.toLowerCase().includes(filters.nom.toLowerCase());
      const matchCategorie = !filters.categorieId || product.categorie?.id === filters.categorieId;
      const matchPrixMin = product.prix >= filters.prixMin;
      const matchPrixMax = product.prix <= filters.prixMax;
      return matchNom && matchCategorie && matchPrixMin && matchPrixMax && product.statut === false;
    });
  }, [products, filters]);

  // Fonction pour activer un produit
  const handleToggleStatus = useCallback(async (productId, newStatus) => {
    setActionLoading(true);
    try {
      const productToUpdate = inactiveProducts.find(p => p.id === productId);
      if (productToUpdate) {
        const updatedProduct = { ...productToUpdate, statut: newStatus };
        await updateProduct(productId, updatedProduct);
        await refreshProducts();
        alert(`✅ Produit "${productToUpdate.nom}" activé avec succès !`);
      }
    } catch (error) {
      console.error("Erreur lors de l'activation:", error);
      alert("❌ Erreur lors de l'activation du produit");
    } finally {
      setActionLoading(false);
    }
  }, [inactiveProducts, refreshProducts]);

  return (
    <div className="home-admin" id="inactive-products-page">
      <div className="admin-header">
        <h1 id="inactive-title">Administration des Produits Inactifs</h1>
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
        <div id="loading-spinner" className="loading-spinner">Chargement des produits inactifs...</div>
      ) : error ? (
        <div id="error-message" className="error-message">
          Erreur: {error.message || "Une erreur est survenue"}
        </div>
      ) : (
        <>
          <div id="products-stats" className="products-stats">
             {inactiveProducts.length} produit(s) inactif(s) trouvé(s)
          </div>
          <div id="admin-products-grid" className="admin-products-grid">
            {inactiveProducts.map((product) => (
              <AdminProductCard
                key={product.id}
                product={product}
                onToggleStatus={handleToggleStatus}
                showEditDelete={false}
                showToggle={true}
                showStatus={true}
                variant="inactive"
              />
            ))}
          </div>
          {inactiveProducts.length === 0 && (
            <div id="no-products-message" className="no-products">
              <div className="no-products-icon"></div>
              <h3>Aucun produit inactif</h3>
              <p>Tous vos produits sont actifs !</p>
            </div>
          )}
        </>
      )}

      {actionLoading && (
        <div id="action-overlay" className="action-overlay">
          <div className="loading-spinner">Traitement en cours...</div>
        </div>
      )}
    </div>
  );
};

export default InactiveProducts;