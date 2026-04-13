import { useState } from "react";

/**
 * Gère l'état des filtres de recherche de produits.
 * @returns {{ searchTerm: string, categoryId: number|null, minPrice: number|null, maxPrice: number|null,
 *   setSearchTerm: Function, setCategoryId: Function, setMinPrice: Function, setMaxPrice: Function,
 *   resetFilters: Function }}
 */
const useFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryId(null);
    setMinPrice(null);
    setMaxPrice(null);
  };

  return {
    searchTerm,
    categoryId,
    minPrice,
    maxPrice,
    setSearchTerm,
    setCategoryId,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  };
};

export { useFilters };
export default useFilters;
