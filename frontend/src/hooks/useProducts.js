// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../api/productApi';

/**
 * Récupère et gère la liste complète des produits avec états de chargement et erreur.
 * @returns {{ products: Array, loading: boolean, error: Error|null, refreshProducts: Function }}
 */
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      // FIX: on s'assure que la réponse est bien un tableau et on élimine
      // les entrées null/undefined avant de stocker, ce qui évite le TypeError
      // "Cannot read properties of undefined (reading 'nom')" dans les composants consommateurs.
      setProducts(Array.isArray(data) ? data.filter(Boolean) : []);
      setError(null);
    } catch (err) {
      setError(err);
      setProducts([]);
      console.error('Error fetching products:', err);
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

export { useProducts };
export default useProducts;
