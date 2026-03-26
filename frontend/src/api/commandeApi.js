import axiosInstance from "./axiosInstance";

export const validerPanier = async () => {
  const response = await axiosInstance.post("/commandes");
  return response.data;
};

export const getMesCommandes = async () => {
  const response = await axiosInstance.get("/commandes");
  return response.data;
};
