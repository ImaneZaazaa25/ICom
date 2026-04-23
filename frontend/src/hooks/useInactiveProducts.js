// src/hooks/useInactiveProducts.js (NOUVEAU FICHIER)
import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../api/productApi';

/**
 * Récupère uniquement les produits inactifs
 * @returns {{ products: Array, loading: boolean, error: Error|null, refreshProducts: Function }}
 */
const useInactiveProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const allProducts = await getAllProducts();
      // Filtrer pour ne garder que les produits inactifs
      const inactiveProducts = allProducts.filter(product => product.statut=== false);
      setProducts(inactiveProducts);
      setError(null);
      console.log(`✅ ${inactiveProducts.length} produits inactifs chargés`);
    } catch (err) {
      setError(err);
      setProducts([]);
      console.error('Error fetching inactive products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refreshProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refreshProducts };
};

export default useInactiveProducts;