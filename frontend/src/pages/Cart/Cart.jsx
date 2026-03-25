import React, { useEffect, useReducer, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice } from "../../utils/formatPrice";
import { validerPanier } from "../../api/commandeApi";
import "./Cart.css";

const initialState = { loading: true, error: null };

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":   return { loading: true,  error: null };
    case "FETCH_SUCCESS": return { loading: false, error: null };
    case "FETCH_ERROR":   return { loading: false, error: action.payload };
    default: return state;
  }
};

const Cart = () => {
  const { user } = useAuth();
  const { panier, fetchPanier, modifierArticle, supprimerArticle } = useCart();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch({ type: "FETCH_START" });
    fetchPanier()
      .then(() => dispatch({ type: "FETCH_SUCCESS" }))
      .catch((err) => dispatch({ type: "FETCH_ERROR", payload: err }));
  }, [user]);

  const handleQuantityChange = async (ligneId, newQty) => {
    const qty = Math.max(1, Number.parseInt(newQty) || 1);
    setActionError(null);
    setActionLoading(true);
    try {
      await modifierArticle(ligneId, qty);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Erreur lors de la mise à jour");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await validerPanier();
      await fetchPanier(); // reset cart badge to 0
      navigate("/orders");
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Erreur lors de la validation de la commande");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (ligneId) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await supprimerArticle(ligneId);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;
  if (state.loading) return <Loader />;
  if (state.error) return <ErrorMessage message={state.error.response?.data?.message || state.error.message || "Erreur lors du chargement du panier"} />;

  const lignes = panier?.lignes ?? [];

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Mon panier</h1>

        {actionError && <ErrorMessage message={actionError} />}

        {lignes.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-text">Votre panier est vide.</p>
            <Link to="/products" className="cart-btn-continue">
              Continuer vos achats
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {lignes.map((ligne) => (
                <div key={ligne.id} className="cart-item">
                  <div className="cart-item-info">
                    <Link to={`/products/${ligne.produitId}`} className="cart-item-name">
                      {ligne.nomProduit}
                    </Link>
                    <p className="cart-item-price">{formatPrice(ligne.prixUnitaire)}</p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-item-quantity">
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(ligne.id, ligne.quantite - 1)}
                        disabled={actionLoading || ligne.quantite <= 1}
                        aria-label="Diminuer la quantité"
                      >
                        −
                      </button>
                      <span className="cart-qty-value">{ligne.quantite}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(ligne.id, ligne.quantite + 1)}
                        disabled={actionLoading}
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>

                    <p className="cart-item-subtotal">{formatPrice(ligne.sousTotal)}</p>

                    <button
                      className="cart-item-remove"
                      onClick={() => handleRemove(ligne.id)}
                      disabled={actionLoading}
                      aria-label="Supprimer l'article"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 className="cart-summary-title">Récapitulatif</h2>
              <div className="cart-summary-row">
                <span>Articles ({lignes.reduce((sum, l) => sum + l.quantite, 0)})</span>
                <span>{formatPrice(panier.total)}</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>{formatPrice(panier.total)}</span>
              </div>
              <button
                className="cart-btn-checkout"
                disabled={actionLoading}
                onClick={handleCheckout}
              >
                {actionLoading ? "Validation en cours…" : "Passer la commande"}
              </button>
              <Link to="/products" className="cart-btn-continue">
                Continuer vos achats
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
