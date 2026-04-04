import React, { useReducer, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../api/productApi";
import { updateProduct, deleteProduct } from "../../api/adminApi";
import ImageCarousel from "../../components/product/ImageCarousel";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice } from "../../utils/formatPrice";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import ProductModal from "../../components/admin/ProductModal";
import { getAllCategories } from "../../api/categoryApi";
import "./ProductDetails.css";

const initialState = { product: null, loading: true, error: null };

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":  return { product: null, loading: true, error: null };
    case "FETCH_SUCCESS": return { product: action.payload, loading: false, error: null };
    case "FETCH_ERROR":  return { product: null, loading: false, error: action.payload };
    default: return state;
  }
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ajouterArticle } = useCart();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [cartSuccess, setCartSuccess] = useState(false);

  // États pour l'admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Lire le rôle depuis localStorage (comme dans Login.jsx)
  const userRole = localStorage.getItem("roles");
  const isAdmin = userRole === 'Admin' || userRole === 'ROLE_Admin';

  // Debug - à supprimer après test
  console.log("Rôle depuis localStorage:", userRole);
  console.log("Est admin:", isAdmin);

  // Charger les catégories pour le modal d'édition
  useEffect(() => {
    if (isAdmin) {
      getAllCategories()
        .then((data) => setCategories(data))
        .catch((err) => console.error("Erreur chargement catégories:", err));
    }
  }, [isAdmin]);

  useEffect(() => {
    const controller = new AbortController();

    getProductById(id, controller.signal)
      .then(data => dispatch({ type: "FETCH_SUCCESS", payload: data }))
      .catch(err => {
        if (!controller.signal.aborted) {
          dispatch({ type: "FETCH_ERROR", payload: err });
        }
      });

    return () => controller.abort();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setCartError(null);
    setCartSuccess(false);
    setCartLoading(true);
    try {
      await ajouterArticle(state.product.id, quantity);
      setCartSuccess(true);
      // Optionnel: reset quantity après 2 secondes
      setTimeout(() => setCartSuccess(false), 2000);
    } catch (err) {
      setCartError(err.response?.data?.message || err.message || "Erreur lors de l'ajout au panier");
    } finally {
      setCartLoading(false);
    }
  };

  // Fonctions admin
  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le produit "${state.product?.nom}" ?`)) {
      setActionLoading(true);
      try {
        await deleteProduct(state.product.id);
        alert("Produit supprimé avec succès !");
        // Rediriger vers la page admin ou la page produits
        if (isAdmin) {
          navigate("/admin/adminhome");
        } else {
          navigate("/products");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du produit");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleModalSubmit = async (productData) => {
    setActionLoading(true);
    try {
      await updateProduct(state.product.id, productData);
      alert("Produit modifié avec succès !");

      // Recharger les données du produit
      const updatedProduct = await getProductById(state.product.id);
      dispatch({ type: "FETCH_SUCCESS", payload: updatedProduct });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Erreur lors de la modification du produit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (state.loading) return <Loader />;
  if (state.error) return <ErrorMessage message={state.error.message || "Erreur lors du chargement du produit"} />;
  if (!state.product) return <ErrorMessage message="Produit introuvable" />;

  const inStock = state.product.quantite > 0;

  return (
    <>
      <div className="product-details">
        <div className="product-details-image">
          <ImageCarousel
            images={state.product.images?.map(img => `http://localhost:9091/uploads/${img.url}`)}
          />
        </div>
        <div className="product-details-info">
          <h1>{state.product.nom}</h1>
          <p className="product-details-category">{state.product.categorie?.nom}</p>
          <p className="product-details-price">{formatPrice(state.product.prix)}</p>
          <p className="product-details-description">{state.product.description}</p>
          <p className={`product-details-stock ${inStock ? "in-stock" : "out-of-stock"}`}>
            {inStock ? `✅ En stock (${state.product.quantite})` : "❌ Rupture de stock"}
          </p>

          {cartError && <p className="product-details-cart-error">{cartError}</p>}
          {cartSuccess && <p className="product-details-cart-success">✓ Produit ajouté au panier !</p>}

          {/* Affichage conditionnel : Admin ou Client */}
          {isAdmin ? (
            // Section Admin : Boutons Modifier et Supprimer
            <div className="product-details-admin-actions">
              <button
                className="btn-edit"
                onClick={handleEdit}
                disabled={actionLoading}
              >
                {actionLoading ? "Chargement..." : " Modifier le produit"}
              </button>
              <button
                className="btn-delete"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Suppression..." : " Supprimer le produit"}
              </button>
            </div>
          ) : (
            // Section Client : Ajout au panier
            <div className="product-details-actions">
              <div className="product-details-quantity">
                <label htmlFor="qty">Quantité :</label>
                <input
                  id="qty"
                  type="number"
                  min="1"
                  max={state.product.quantite}
                  value={quantity}
                  onChange={(e) => {
                    setCartSuccess(false);
                    setCartError(null);
                    setQuantity(Math.max(1, Math.min(Number.parseInt(e.target.value) || 1, state.product.quantite)));
                  }}
                />
              </div>
              <div className="product-details-buttons">
                <button
                  className="btn-add-cart"
                  disabled={!inStock || cartLoading}
                  onClick={handleAddToCart}
                >
                  {cartLoading ? " Ajout en cours…" : " Ajouter au panier"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition pour l'admin */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        product={state.product}
        categories={categories}
      />

      {/* Overlay de chargement */}
      {actionLoading && (
        <div className="action-overlay">
          <div className="loading-spinner">Traitement en cours...</div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;