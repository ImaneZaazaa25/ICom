// src/pages/admin/InactiveProducts.jsx
import React, { useMemo, useCallback, useState } from "react";
import useInactiveProducts from "../../hooks/useInactiveProducts"; // Changement ici
import useFilters from "../../hooks/useFilters";
import { updateProduct } from "../../api/adminApi";
import AdminProductCard from "../../components/admin/AdminProductCard";
import ProductFilters from "../../components/product/ProductFilters";
import { filterProducts } from "../../utils/filterProducts";
import useCategories from "../../hooks/useCategories";
import "./HomeAdmin.css";

const InactiveProducts = () => {
  // Changement: utiliser useInactiveProducts au lieu de useProducts
  const { products, loading, error, refreshProducts } = useInactiveProducts();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [actionLoading, setActionLoading] = useState(false);
  const categories = useCategories();

  // Simplification: plus besoin de filtrer les inactifs car products contient déjà uniquement les inactifs
  const filteredProducts = useMemo(() => {
    // Sécurité 1: Vérifier que products existe et est un tableau
    if (!products || !Array.isArray(products)) {
      console.warn("Products n'est pas un tableau:", products);
      return [];
    }

    console.log("Produits inactifs reçus:", products);

    // Sécurité 2: Nettoyage complet des produits
    const validProducts = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      // Vérification rigoureuse
      if (product && typeof product === 'object' && product.id && product.nom) {
        validProducts.push(product);
      } else {
        console.warn(`Produit invalide à l'index ${i}:`, product);
      }
    }

    // Sécurité 3: Vérifier que filterProducts existe et est une fonction
    let filtered = validProducts;
    if (typeof filterProducts === 'function') {
      try {
        filtered = filterProducts(validProducts, filters);
      } catch (err) {
        console.error("Erreur dans filterProducts:", err);
        filtered = validProducts;
      }
    }

    // Note: Plus besoin de filtrer les inactifs car products ne contient déjà que des inactifs
    return filtered;
  }, [products, filters]);

  const handleToggleStatus = useCallback(async (productId, newStatus) => {
    setActionLoading(true);
    try {
      // Chercher le produit dans filteredProducts au lieu de inactiveProducts
      const productToUpdate = filteredProducts.find(p => p && p.id === productId);
      if (productToUpdate) {
        const payload = {
          nom: productToUpdate.nom,
          description: productToUpdate.description,
          prix: productToUpdate.prix,
          quantite: productToUpdate.quantite,
          categorieId: productToUpdate.categorie?.id,
          statut: newStatus,
        };
        await updateProduct(productId, payload);
        await refreshProducts(); // Rafraîchit la liste des produits inactifs
        alert(`✅ Produit ${newStatus ? 'activé' : 'désactivé'} avec succès !`);
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("❌ Erreur lors du changement de statut");
    } finally {
      setActionLoading(false);
    }
  }, [filteredProducts, refreshProducts]);

  if (loading) return <div id="loading-spinner" className="loading-spinner">Chargement...</div>;
  if (error) return <div id="error-message" className="error-message">Erreur: {error.message}</div>;

  return (
    <div className="inactive-products" id="inactive-products-page">
      <div className="inactive-header">
        <h1 id="inactive-title">Produits Inactifs</h1>
      </div>

      <div id="inactive-filters-section">
        <ProductFilters
          filters={filters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          categories={categories}
        />
      </div>

      <div id="inactive-products-stats" className="products-stats">
        {filteredProducts.length} produit(s) inactif(s)
      </div>

      <div id="inactive-products-grid" className="inactive-products-grid">
        {filteredProducts.map((product) => (
          <AdminProductCard
            key={product.id}
            product={product}
            onToggleStatus={handleToggleStatus}
            showEditDelete={true}
            showToggle={true}
            showStatus={true}
            variant="inactive"
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div id="no-products-message" className="no-products">
          <h3>Aucun produit inactif</h3>
        </div>
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