import { useState } from "react";

const useFilters = () => {
  const [filters, setFilters] = useState({
    nom: "",
    categorieId: null,
    prixMin: 0,
    prixMax: 999999,
  });

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () =>
    setFilters({ nom: "", categorieId: null, prixMin: 0, prixMax: 999999 });

  return { filters, updateFilter, resetFilters };
};

export default useFilters;
