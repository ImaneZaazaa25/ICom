import React, { createContext, useContext, useState, useMemo } from "react";
import { signin, signup } from "../services/api";

export const AuthContext = createContext();

// Décode le payload JWT sans bibliothèque externe
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Token expiré ?
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Restaure la session depuis localStorage au démarrage / reload
function restoreUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) {
    // Token invalide ou expiré — nettoyage automatique
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    return null;
  }

  return {
    username: localStorage.getItem("username") || payload.sub || "",
    role: localStorage.getItem("roles") || payload.roles?.[0] || payload.role || "",
    token,
  };
}

export const AuthProvider = ({ children }) => {
  // Initialisé depuis localStorage dès le premier rendu (pas de flash null → redirect)
  const [user, setUser] = useState(restoreUser);

  const login = async (username, password) => {
    const token = await signin({ username, motdepasse: password });
    if (!token) throw new Error("Token non reçu depuis le backend");

    const payload = decodeToken(token);
    const role =
      payload?.roles?.[0] ||
      payload?.role ||
      payload?.authorities?.[0] ||
      "";

    // Persistance localStorage (une seule fois, ici)
    localStorage.setItem("token", token);
    localStorage.setItem("roles", role);
    localStorage.setItem("username", username);

    const userData = { username, role, token };
    setUser(userData);
    return { token, role };
  };

  const register = async (userData) => {
    return await signup({
      nom: userData.nom || "",
      prenom: userData.prenom || "",
      username: userData.username,
      email: userData.email,
      tel: userData.tel || "",
      motdepasse: userData.motdepasse,
      role: userData.role || "User",
      status: userData.status || "ACTIVE",
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook unique exporté depuis ce fichier — aucune duplication ailleurs
export const useAuth = () => useContext(AuthContext) || {};
