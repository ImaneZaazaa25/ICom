import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { ajouterAuPanier, validerPanier as validerPanierApi } from "../../api/cartApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice } from "../../utils/formatPrice";
import "./Cart.css";

const Cart = () => {
  const { cartItems, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleQuantityChange = (id, newQty) => {
    const qty = Math.max(1, Number.parseInt(newQty) || 1);
    updateQuantity(id, qty);
  };

  const handleCheckout = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      // Synchronise le panier local vers le panier serveur avant validation
      for (const item of cartItems) {
        await ajouterAuPanier(item.id, item.quantite);
      }
      await validerPanierApi();
      clearCart();
      navigate("/orders");
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Erreur lors de la validation de la commande");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleClear = () => {
    clearCart();
  };

  if (actionLoading) return <Loader />;

  return (
    <div id="cart-container" className="cart-page">
      <div className="cart-inner">
        <h1 className="cart-title">Mon panier</h1>

        {actionError && <ErrorMessage message={actionError} />}

        {cartItems.length === 0 ? (
          <div id="cart-empty-msg" className="cart-empty">
            <p className="cart-empty-text">Votre panier est vide.</p>
            <Link to="/products" className="cart-btn-continue">
              Continuer vos achats
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} id={`cart-item-${item.id}`} className="cart-item">
                  <div className="cart-item-info">
                    <Link to={`/products/${item.id}`} className="cart-item-name">
                      {item.nom}
                    </Link>
                    <p className="cart-item-price">{formatPrice(item.prix)}</p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-item-quantity">
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantite - 1)}
                        disabled={item.quantite <= 1}
                        aria-label="Diminuer la quantité"
                      >
                        −
                      </button>
                      <input
                        id={`cart-item-quantity-${item.id}`}
                        type="number"
                        className="cart-qty-value"
                        value={item.quantite}
                        min="1"
                        max={item.stock}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        aria-label="Quantité"
                      />
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantite + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>

                    <p id={`cart-item-subtotal-${item.id}`} className="cart-item-subtotal">
                      {formatPrice(item.prix * item.quantite)}
                    </p>

                    <button
                      id={`cart-item-remove-btn-${item.id}`}
                      className="cart-item-remove"
                      onClick={() => handleRemove(item.id)}
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
                <span>Articles ({cartItems.reduce((sum, i) => sum + i.quantite, 0)})</span>
                <span id="cart-total-price">{formatPrice(total)}</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button
                id="cart-validate-btn"
                className="cart-btn-checkout"
                onClick={handleCheckout}
              >
                Passer la commande
              </button>
              <button
                id="cart-clear-btn"
                className="cart-btn-clear"
                onClick={handleClear}
              >
                Vider le panier
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
