import React, { useReducer, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMesCommandes } from "../../api/commandeApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice } from "../../utils/formatPrice";
import useAuth from "../../hooks/useAuth";
import "./Orders.css";

const initialState = { commandes: [], loading: true, error: null };

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":   return { commandes: [],             loading: true,  error: null };
    case "FETCH_SUCCESS": return { commandes: action.payload, loading: false, error: null };
    case "FETCH_ERROR":   return { commandes: [],             loading: false, error: action.payload };
    default: return state;
  }
};

const ETAT_LABELS = {
  EN_COURS: "En cours",
  VALIDEE:  "Validée",
  ANNULEE:  "Annulée",
};

const formatDate = (dateString) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch({ type: "FETCH_START" });
    getMesCommandes()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.dateCommande) - new Date(a.dateCommande)
        );
        dispatch({ type: "FETCH_SUCCESS", payload: sorted });
      })
      .catch((err) =>
        dispatch({ type: "FETCH_ERROR", payload: err })
      );
  }, [user]);

  if (!user) return null;
  if (state.loading) return <Loader />;
  if (state.error)
    return (
      <ErrorMessage
        message={
          state.error.response?.data?.message ||
          state.error.message ||
          "Erreur lors du chargement des commandes"
        }
      />
    );

  const toggleOpen = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1 className="orders-title">Mes commandes</h1>

        {state.commandes.length === 0 ? (
          <div className="orders-empty">
            <p className="orders-empty-text">Vous n'avez pas encore de commandes.</p>
            <Link to="/products" className="orders-btn-shop">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {state.commandes.map((commande) => (
              <div key={commande.id} className="order-card">
                <button
                  className="order-card-header"
                  onClick={() => toggleOpen(commande.id)}
                  aria-expanded={openId === commande.id}
                >
                  <div className="order-card-meta">
                    <span className="order-card-id">Commande #{commande.id}</span>
                    <span className="order-card-date">{formatDate(commande.dateCommande)}</span>
                  </div>
                  <div className="order-card-right">
                    <span className={`order-card-status order-status-${commande.etat.toLowerCase()}`}>
                      {ETAT_LABELS[commande.etat] ?? commande.etat}
                    </span>
                    <span className="order-card-total">{formatPrice(commande.total)}</span>
                    <span className="order-card-chevron">
                      {openId === commande.id ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {openId === commande.id && (
                  <div className="order-card-body">
                    <table className="order-lines-table">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Prix unitaire</th>
                          <th>Qté</th>
                          <th>Sous-total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commande.lignes.map((ligne) => (
                          <tr key={ligne.id}>
                            <td>
                              <Link to={`/products/${ligne.produitId}`} className="order-line-name">
                                {ligne.nomProduit}
                              </Link>
                            </td>
                            <td>{formatPrice(ligne.prixUnitaire)}</td>
                            <td>{ligne.quantite}</td>
                            <td className="order-line-subtotal">{formatPrice(ligne.sousTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="order-card-footer">
                      <span className="order-card-footer-label">Total de la commande</span>
                      <span className="order-card-footer-total">{formatPrice(commande.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
