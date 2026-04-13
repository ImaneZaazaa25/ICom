import { useState, useEffect } from "react";
import { getAllCategories } from "../api/categoryApi";

/**
 * Récupère la liste de toutes les catégories de produits.
 * @returns {Array} Liste des catégories { id, nom }
 */
const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  return categories;
};

export { useCategories };
export default useCategories;
