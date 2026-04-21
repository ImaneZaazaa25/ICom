import { useState, useEffect, useCallback } from 'react';
import { getActiveProducts } from '../api/productApi';

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
      const data = await getActiveProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err);
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
