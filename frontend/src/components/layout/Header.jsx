import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useContext(CartContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const userRole = localStorage.getItem("roles");
  const isAdmin = userRole === 'Admin' || userRole === 'ROLE_Admin';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout(); // nettoie localStorage + state
    navigate("/");
    closeMenu();
  };

  return (
    <>
      <header className={`header${scrolled ? " scrolled" : ""}`}>
        <div className="header-inner">
          <div className="header-logo">
            <Link id="nav-home-link" to="/products" onClick={closeMenu}>ICOM</Link>
          </div>

          {isAdmin ? (
            <nav className="header-nav">
              <Link to="/admin/dash" onClick={closeMenu}>Dashboard</Link>
              <Link to="/admin/adminhome" onClick={closeMenu}>Gestion des Produits</Link>
              <Link to="/admin/inactive-products" onClick={closeMenu}>Produits Inactifs</Link>
            </nav>
          ) : (
            <nav className="header-nav">
              <Link id="nav-products-link" to="/products" onClick={closeMenu}>Produits</Link>
              {user && <Link id="nav-orders-link" to="/orders" onClick={closeMenu}>Mes commandes</Link>}
            </nav>
          )}

          <div className="header-right">
            <div className="header-auth">
              {user ? (
                <>
                  <span className="header-user">{user.username}</span>
                  {!isAdmin && <Link id="nav-profile-link" to="/profile" className="header-profile-link">Profil</Link>}
                </>
              ) : (
                <>
                  <Link id="nav-login-link" to="/login" className="header-auth-link">Se connecter</Link>
                  {!isAdmin && <Link id="nav-register-link" to="/register" className="header-auth-link">S'inscrire</Link>}
                </>
              )}
            </div>

            {!isAdmin && (
              <div className="header-cart">
                <Link id="nav-cart-link" to="/cart">
                  <svg className="header-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {cartCount > 0 && (
                    <span id="nav-cart-badge" className="header-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                  )}
                </Link>
              </div>
            )}

            {user && (
              <button id="nav-logout-btn" className="header-logout-btn" onClick={handleLogout}>
                Déconnexion
              </button>
            )}

            <button
              className={`header-hamburger${menuOpen ? " active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`header-mobile-menu${menuOpen ? " open" : ""}`}>
        {isAdmin ? (
          <>
            <Link to="/admin/adminhome" onClick={closeMenu}>Gestion des Produits</Link>
            <Link to="/admin/inactive-products" onClick={closeMenu}>Produits Inactifs</Link>
            <button onClick={handleLogout} className="mobile-logout-btn">Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/products" onClick={closeMenu}>Produits</Link>
            <Link to="/cart" onClick={closeMenu}>Panier</Link>
            {user && <Link to="/orders" onClick={closeMenu}>Mes commandes</Link>}
            {user ? (
              <>
                <Link to="/profile" onClick={closeMenu}>Mon profil</Link>
                <button onClick={handleLogout} className="mobile-logout-btn">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>Se connecter</Link>
                <Link to="/register" onClick={closeMenu}>S'inscrire</Link>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Header;
