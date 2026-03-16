import React from "react";

import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import ProductGrid from "../../components/product/ProductGrid";
import "./Home.css";

const Home = () => {
  const { products, loading, error } = useProducts();

  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>Bienvenue chez ICOM</h1>
        <p>
          Découvrez notre sélection de produits soigneusement choisis pour vous.
          Qualité, style et simplicité.
        </p>
        <Link to="/products" className="home-hero-btn">
          Voir les produits
        </Link>
      </section>

      <section className="home-products">
        <div className="home-products-header">
          <h2>Nouveautés</h2>
          <Link to="/products">Voir tout &rarr;</Link>
        </div>
        <ProductGrid
          products={products.slice(0, 8)}
          loading={loading}
          error={error}
        />
      </section>
    </div>
  );
};

export default Home;

