import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Orders from "../pages/Orders/Orders";
import Profile from "../pages/Profile/Profile";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import HomeAdmin from "../pages/admin/HomeAdmin"; // <-- Importez HomeAdmin
import InactiveProducts from "../pages/admin/InactiveProducts";

function AppRoutes() {
  return (
    <Router>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Route admin - protégée par un PrivateRoute si nécessaire */}
          <Route path="/admin/adminhome" element={<HomeAdmin />} />
          <Route path = "/admin/inactive-products" element= {<InactiveProducts/>} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default AppRoutes;