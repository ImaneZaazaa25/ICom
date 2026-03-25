import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import "./Header.css";

const Header = () => {
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`header${scrolled ? " scrolled" : ""}`}>
        <div className="header-inner">
          <div className="header-logo">
            <Link to="/" onClick={closeMenu}>ICOM</Link>
          </div>

          <nav className="header-nav">
            <Link to="/products">Produits</Link>
            {user && <Link to="/orders">Mes commandes</Link>}
          </nav>

          <div className="header-right">
            <div className="header-auth">
              {user ? (
                <Link to="/profile" className="header-user">{user.username}</Link>
              ) : (
                <>
                  <Link to="/login" className="header-auth-link">Se connecter</Link>
                  <Link to="/register" className="header-auth-link">S'inscrire</Link>
                </>
              )}
            </div>

            <div className="header-cart">
              <Link to="/cart">
                <svg className="header-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && (
                  <span className="header-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                )}
              </Link>
            </div>

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

      {/* Mobile menu */}
      <div className={`header-mobile-menu${menuOpen ? " open" : ""}`}>
        <Link to="/products" onClick={closeMenu}>Produits</Link>
        <Link to="/cart" onClick={closeMenu}>Panier</Link>
        {user && <Link to="/orders" onClick={closeMenu}>Mes commandes</Link>}
        {user ? (
          <Link to="/profile" className="header-user" onClick={closeMenu}>{user.username}</Link>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Se connecter</Link>
            <Link to="/register" onClick={closeMenu}>S'inscrire</Link>
          </>
        )}
      </div>
    </>
  );
};

export default Header;
