import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook personnalisé pour accéder facilement au contexte d'authentification
 * @returns {Object} { user, login, register }
 */
const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;