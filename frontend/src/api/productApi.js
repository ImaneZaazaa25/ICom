import axiosInstance from "./axiosInstance";

export const getAllProducts = async () => {
  const response = await axiosInstance.get("/produits");
  return response.data;
};

export const getActiveProducts = async () => {
  const response = await axiosInstance.get("/produits/actifs");
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/produits/${id}`);
  return response.data;
};

export const getProductsByName = async (keyword) => {
  const response = await axiosInstance.get(`/produits/nom/${keyword}`);
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await axiosInstance.get(`/produits/categorie/${categoryId}`);
  return response.data;
};

export const getProductsByPrice = async (min, max) => {
  const response = await axiosInstance.get("/produits/prix", {
    params: { min, max },
  });
  return response.data;
};
