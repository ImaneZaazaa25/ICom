import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from '../../hooks/useAuth';
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const userData = {
      username,
      motdepasse: password
    };

    try {
      const token = await login(userData);

      localStorage.setItem("token", token);
if (!token) {
  throw new Error("Token non reçu depuis le backend");
}

const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.roles?.[0] || payload.role || payload.authorities?.[0];

      localStorage.setItem("roles", userRole);
      localStorage.setItem("username", username);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedUsername", username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedUsername");
      }

      // Redirection basée sur le rôle
      if (userRole === 'Admin' || userRole === 'ROLE_Admin') {
        navigate("/admin/adminhome");
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

  // Charger le username sauvegardé si "remember me" était coché
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

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
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

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
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
          Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;