import React from "react";

import useProducts from "../../hooks/useProducts";
import ProductGrid from "../../components/product/ProductGrid";
import "./Home.css";

const Home = () => {
  const { products, loading, error } = useProducts();

  return (
    <div className="home-page">
    
      <section className="home-products">
       
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

