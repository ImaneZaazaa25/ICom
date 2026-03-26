import React, { createContext, useState } from "react";
import {
  getPanier,
  ajouterAuPanier,
  modifierQuantite,
  supprimerLigne,
} from "../api/cartApi";
import PropTypes from "prop-types";
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [panier, setPanier] = useState(null);

  const fetchPanier = async () => {
    try {
      const data = await getPanier();
      setPanier(data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const ajouterArticle = async (produitId, quantite) => {
    try {
      const data = await ajouterAuPanier(produitId, quantite);
      setPanier(data);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const modifierArticle = async (ligneId, quantite) => {
    try {
      const data = await modifierQuantite(ligneId, quantite);
      setPanier(data);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const supprimerArticle = async (ligneId) => {
    try {
      const data = await supprimerLigne(ligneId);
      setPanier(data);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const cartCount = panier?.lignes?.reduce((sum, l) => sum + l.quantite, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ panier, fetchPanier, ajouterArticle, modifierArticle, supprimerArticle, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};