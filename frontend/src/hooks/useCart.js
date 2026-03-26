import { useContext } from "react";
import { CartContext } from "../context/CartContext";

/**
 * Hook personnalisé pour accéder facilement au contexte du panier
 * @returns {Object} { panier, fetchPanier, ajouterArticle, modifierArticle, supprimerArticle, cartCount }
 */
const useCart = () => {
  return useContext(CartContext);
};

export default useCart;
