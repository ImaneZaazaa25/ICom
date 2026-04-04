import React from "react";
import PropTypes from "prop-types";

const ProductFilters = ({ filters, onFilterChange, onReset, categories }) => {
  return (
    <div className="product-filters">
      <input
        type="text"
        placeholder="Rechercher par nom..."
        value={filters.nom}
        onChange={(e) => onFilterChange("nom", e.target.value)}
        className="filter-input"
      />

      <select
        value={filters.categorieId || ""}
        onChange={(e) =>
          onFilterChange("categorieId", e.target.value ? Number(e.target.value) : null)
        }
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
        type="number"
        placeholder="Prix min"
        value={filters.prixMin || ""}
        onChange={(e) => onFilterChange("prixMin", Number(e.target.value))}
        className="filter-input"
      />

      <input
        type="number"
        placeholder="Prix max"
        value={filters.prixMax === 999999 ? "" : filters.prixMax}
        onChange={(e) =>
          onFilterChange("prixMax", e.target.value ? Number(e.target.value) : 999999)
        }
        className="filter-input"
      />

      <button onClick={onReset} className="filter-reset-btn">
        Réinitialiser
      </button>
    </div>
  );
};

ProductFilters.propTypes = {
  filters: PropTypes.shape({
    nom: PropTypes.string,
    categorieId: PropTypes.number,
    prixMin: PropTypes.number,
    prixMax: PropTypes.number,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nom: PropTypes.string.isRequired,
  })).isRequired,
};
export default ProductFilters;