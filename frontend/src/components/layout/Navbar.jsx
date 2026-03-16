import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">E-Commerce</Link>
      </div>
      <div className="navbar-links">
        <Link to="/products">Produits</Link>
        <Link to="/cart">Panier</Link>
      </div>
      <div className="navbar-auth">
        {user ? (
          <span className="navbar-user">{user.username}</span>
        ) : (
          <>
            <Link to="/login" className="navbar-auth-link">Connexion</Link>
            <Link to="/register" className="navbar-auth-link">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
