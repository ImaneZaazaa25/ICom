import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerUser } from "../../api/userApi";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    username: "",
    email: "",
    tel: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;

    if (strength <= 2) setPasswordStrength("weak");
    else if (strength === 3 || strength === 4) setPasswordStrength("medium");
    else setPasswordStrength("strong");
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case "weak": return "Faible";
      case "medium": return "Moyen";
      case "strong": return "Fort";
      default: return "";
    }
  };

  const validateForm = () => {
    if (!formData.email.includes("@")) {
      setError("Veuillez entrer un email valide");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (!formData.tel.match(/^[0-9]{10}$/)) {
      setError("Veuillez entrer un numéro de téléphone valide (10 chiffres)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const userData = {
      nom: formData.nom,
      prenom: formData.prenom,
      username: formData.username,
      email: formData.email,
      tel: formData.tel,
      motdepasse: formData.password,
      role: "User",
      status: "Active"
    };

    try {
      await registerUser(userData);
      setMessage("Inscription réussie ! Redirection vers la page de connexion...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h2>Créer un compte</h2>
          <p>Rejoignez-nous et découvrez nos produits</p>
        </div>

        <form id="register-form" onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="register-lastname-input">Nom</label>
              <input
                id="register-lastname-input"
                type="text"
                name="nom"
                placeholder="Nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-firstname-input">Prénom</label>
              <input
                id="register-firstname-input"
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-username-input">Nom d'utilisateur</label>
            <input
              id="register-username-input"
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email-input">Email</label>
            <input
              id="register-email-input"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-phone-input">Téléphone</label>
            <input
              id="register-phone-input"
              type="tel"
              name="tel"
              placeholder="Téléphone (10 chiffres)"
              value={formData.tel}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password-input">Mot de passe</label>
            <input
              id="register-password-input"
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {passwordStrength && (
              <div className={`password-strength strength-${passwordStrength}`}>
                Force du mot de passe : {getStrengthText()}
              </div>
            )}
          </div>

          <button
            id="register-submit-btn"
            type="button"
            onClick={handleSubmit}
            className="register-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div id="register-error-msg" className="error-message">{error}</div>}

        <div className="login-link">
          Déjà un compte ? <Link id="register-login-link" to="/login">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
