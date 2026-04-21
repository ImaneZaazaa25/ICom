import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook personnalisé pour accéder facilement au contexte d'authentification.
 * @returns {{ user: Object|null, login: Function, register: Function, logout: Function }}
 */
export const useAuth = () => {
  return useContext(AuthContext) || {};
};

export default useAuth;
