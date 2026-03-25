import axiosInstance from "./axiosInstance";

export const getPanier = async () => {
  const response = await axiosInstance.get("/panier");
  return response.data;
};

export const ajouterAuPanier = async (produitId, quantite) => {
  const response = await axiosInstance.post("/panier/items", { produitId, quantite });
  return response.data;
};

export const modifierQuantite = async (ligneId, quantite) => {
  const response = await axiosInstance.put(`/panier/items/${ligneId}`, { quantite });
  return response.data;
};

export const supprimerLigne = async (ligneId) => {
  const response = await axiosInstance.delete(`/panier/items/${ligneId}`);
  return response.data;
};
