import React, { useState } from "react";
import PropTypes from "prop-types";

const ProductFilters = ({
  categories,
  onSearchChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [minPriceValue, setMinPriceValue] = useState("");
  const [maxPriceValue, setMaxPriceValue] = useState("");

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setCategoryValue(e.target.value);
    if (onCategoryChange) onCategoryChange(val);
  };

  const handleMinPriceChange = (e) => {
    setMinPriceValue(e.target.value);
    if (onMinPriceChange) onMinPriceChange(e.target.value ? Number(e.target.value) : null);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPriceValue(e.target.value);
    if (onMaxPriceChange) onMaxPriceChange(e.target.value ? Number(e.target.value) : null);
  };

  const handleReset = () => {
    setSearchValue("");
    setCategoryValue("");
    setMinPriceValue("");
    setMaxPriceValue("");
    if (onReset) onReset();
  };

  return (
    <div className="product-filters">
      <input
        id="filters-search-input"
        type="text"
        placeholder="Rechercher par nom..."
        value={searchValue}
        onChange={handleSearchChange}
        className="filter-input"
      />

      <select
        id="filters-category-select"
        value={categoryValue}
        onChange={handleCategoryChange}
        className="filter-select"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nom}
          </option>
        ))}
      </select>

      <input
        id="filters-price-min-input"
        type="number"
        placeholder="Prix min"
        value={minPriceValue}
        onChange={handleMinPriceChange}
        className="filter-input"
      />

      <input
        id="filters-price-max-input"
        type="number"
        placeholder="Prix max"
        value={maxPriceValue}
        onChange={handleMaxPriceChange}
        className="filter-input"
      />

      <button id="filters-reset-btn" onClick={handleReset} className="filter-reset-btn">
        Réinitialiser
      </button>
    </div>
  );
};

ProductFilters.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nom: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSearchChange: PropTypes.func,
  onCategoryChange: PropTypes.func,
  onMinPriceChange: PropTypes.func,
  onMaxPriceChange: PropTypes.func,
  onReset: PropTypes.func,
};
export default ProductFilters;