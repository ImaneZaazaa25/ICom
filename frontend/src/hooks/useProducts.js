import { useState, useEffect } from "react";
import { getAllProducts } from "../api/productApi";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        setProducts(data);
        console.log("Products fetched:", data); // <-- affiche le retour dans la console
      })
      .catch((err) => {
        setError(err);
        console.error("Error fetching products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
};

export default useProducts;