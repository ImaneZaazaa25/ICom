import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import
import useAuth from '../../hooks/useAuth';
import "./Register.css";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate(); // <-- initialise le navigate
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      nom,
      prenom,
      username,
      email,
      tel,
      motdepasse: password,
      role: "User",
      status: "Active"
    };

    console.log("Données envoyées :", userData);

    try {
      const result = await register(userData);
      console.log("Réponse du backend :", result);
      setMessage(result);

      // Si l'inscription réussit, redirige vers /login
      navigate("/login");
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err.response || err.message || err);
      setMessage("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="auth-container">
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" placeholder="Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">S'inscrire</button>
      </form>
      {message && <p className="success">{message}</p>}
    </div>
  );
}

export default Register;