import React, { useReducer, useEffect ,} from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../../api/productApi";
import ImageCarousel from "../../components/product/ImageCarousel";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice } from "../../utils/formatPrice";
import "./ProductDetails.css";
const initialState = { product: null, loading: true, error: null };

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":  return { product: null, loading: true,  error: null };
    case "FETCH_SUCCESS": return { product: action.payload, loading: false, error: null };
    case "FETCH_ERROR":  return { product: null, loading: false, error: action.payload };
    default: return state;
  }
};

const ProductDetails = () => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);

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

  if (state.loading) return <Loader />;
  if (state.error) return <ErrorMessage message={state.error.message || "Erreur lors du chargement du produit"} />;
  if (!state.product) return <ErrorMessage message="Produit introuvable" />;

  return (
    <div className="product-details">
      <div className="product-details-image">
<ImageCarousel 
  images={state.product.images?.map(img => `http://localhost:9091/uploads/${img.url}`)} 
/>      </div>
      <div className="product-details-info">
        <h1>{state.product.nom}</h1>
        <p className="product-details-category">{state.product.categorie?.nom}</p>
        <p className="product-details-price">{formatPrice(state.product.prix)}</p>
        <p className="product-details-description">{state.product.description}</p>
        <p className="product-details-stock">
          {state.product.quantite > 0 ? `En stock (${state.product.quantite})` : "Rupture de stock"}
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;