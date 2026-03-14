import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username,
      motdepasse: password // 🔹 clé exacte pour backend
    };

    try {
      const token = await login(userData);
      alert("Connexion réussie !");
      localStorage.setItem("token", token); // stocke le JWT
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