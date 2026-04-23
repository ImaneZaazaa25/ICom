import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import useCart from '../../hooks/useCart';
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { flushPendingCart } = useCart() || {};
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // login() gère localStorage (token, roles, username) et retourne { token, role }
      const { role } = await login(username, password);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedUsername", username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedUsername");
      }

      const hasPendingCart = !!localStorage.getItem("pendingCart");
      flushPendingCart?.();

      if (role === "Admin" || role === "ROLE_Admin") {
        navigate("/admin/adminhome");
      } else if (hasPendingCart) {
        navigate("/cart");
      } else {
        navigate("/products");
      }

    } catch (err) {
      console.error("Erreur login :", err);
      setError("Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const remember = localStorage.getItem("rememberMe");
    if (remember === "true" && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
            </svg>
          </div>
          <h2>Bienvenue</h2>
          <p>Connectez-vous pour accéder à votre compte</p>
        </div>

        <form id="login-form" onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-username-input">Nom d'utilisateur</label>
            <input
              id="login-username-input"
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password-input">Mot de passe</label>
            <input
              id="login-password-input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Se souvenir de moi
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <div id="login-error-msg" className="error-message">{error}</div>}

          <button
            id="login-submit-btn"
            type="button"
            onClick={handleSubmit}
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="register-link">
          Pas encore de compte ? <Link id="login-register-link" to="/register">Inscrivez-vous</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
