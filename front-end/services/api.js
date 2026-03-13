import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9091/api", // backend Spring Boot
});

export const signin = async (user) => {
  const response = await api.post("/auth/signin", {
    username: user.username, // utiliser username comme dans ton AuthService
    motdepasse: user.password || user.motdepasse
  });
  return response.data; // c'est le token JWT
};

export const signup = async (user) => {
  const response = await api.post("/auth/signup", {
    nom: user.nom || "",
    prenom: user.prenom || "",
    username: user.username,
    email: user.email,
    motdepasse: user.password || user.motdepasse,
    role: user.role || "USER",
    tel: user.tel || "",
    status: user.status || "ACTIVE"
  });
  return response.data; // c'est le message du backend
};

export default api;