import React, { useState, useMemo, useCallback } from "react";
import { CartContext } from "./CartContext";
import { validerPanier as validerPanierApi } from "../api/cartApi";
import PropTypes from "prop-types";

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    if (!product || product.actif === false) return;
    const safeQty = Math.max(1, qty);
    // Le backend peut renvoyer "stock" ou "quantite" selon l'endpoint
    const stockValue = product.stock ?? product.quantite;
    const safeStock =
      typeof stockValue === 'number' && stockValue > 0 ? stockValue : Infinity;
    const quantity = Math.min(safeQty, safeStock);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantite + quantity, safeStock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantite: newQty } : item
        );
      }
      return [...prev, { ...product, quantite: quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const updateQuantity = (id, qty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantite: qty } : item
      )
    );
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.prix * item.quantite,
    0
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantite,
    0
  );

  const validerPanier = useCallback(async () => {
    if (cartItems.length === 0) {
      throw new Error("Le panier est vide");
    }
    const result = await validerPanierApi();
    clearCart();
    return result;
  }, [cartItems]);

  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      total,
      cartCount,
      validerPanier,
    }),
    [cartItems, total, cartCount, validerPanier]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CartProvider;