import React, { createContext, useState } from "react";
import { signin, signup } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Connexion
  const login = async (userData) => {
    try {
      const token = await signin({
        username: userData.username,
        motdepasse: userData.motdepasse, // clé exacte attendue par Spring
      });

      setUser({ ...userData, token });
      localStorage.setItem("token", token);
      return token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      const result = await signup({
        nom: userData.nom,
        prenom: userData.prenom,
        username: userData.username,
        email: userData.email,
        tel: userData.tel,
        motdepasse: userData.motdepasse, // clé exacte
        role: userData.role || "CLIENT",   // valeur par défaut
        status: userData.status || "ACTIVE" // valeur par défaut
      });

      return result; // message retourné par Spring
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};