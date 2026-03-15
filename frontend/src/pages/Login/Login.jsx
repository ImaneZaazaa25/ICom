import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import
import useAuth from '../../hooks/useAuth';
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate(); // <-- initialise le navigate
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username,
      motdepasse: password
    };

    try {
      const token = await login(userData);
      alert("Connexion réussie !");
      localStorage.setItem("token", token); // stocke le JWT
      console.log(token);

      // Redirection vers la page home après login réussi
      navigate("/home");
    } catch (err) {
      console.error("Erreur login :", err.response || err.message || err);
      setError("Nom d'utilisateur ou mot de passe incorrect");
    }
  };

  return (
    <div className="auth-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;