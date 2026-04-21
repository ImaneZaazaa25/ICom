import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link id="nav-home-link" to="/">E-Commerce</Link>
      </div>
      <div className="navbar-links">
        <Link id="nav-products-link" to="/products">Produits</Link>
        <Link id="nav-cart-link" to="/cart">
          Panier
          {cartItems && cartItems.length > 0 && (
            <span id="nav-cart-badge" className="cart-badge">{cartItems.length}</span>
          )}
        </Link>
      </div>
      <div className="navbar-auth">
        {user ? (
          <>
            <Link id="nav-profile-link" to="/profile" className="navbar-auth-link">{user.username}</Link>
            <button id="nav-logout-btn" onClick={logout} className="navbar-logout-btn">Déconnexion</button>
          </>
        ) : (
          <>
            <Link id="nav-login-link" to="/login" className="navbar-auth-link">Connexion</Link>
            <Link id="nav-register-link" to="/register" className="navbar-auth-link">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
