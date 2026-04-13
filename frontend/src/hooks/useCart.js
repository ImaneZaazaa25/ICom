import { useContext } from "react";
import { CartContext } from "../context/CartContext";

/**
 * Hook personnalisé pour accéder facilement au contexte du panier.
 * @returns {{ cartItems: Array, addToCart: Function, removeFromCart: Function, clearCart: Function,
 *   updateQuantity: Function, total: number, cartCount: number, validerPanier: Function }}
 */
const useCart = () => {
  return useContext(CartContext);
};

export default useCart;
