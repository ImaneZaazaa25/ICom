// src/api/adminApi.js
import axiosInstance from "./axiosInstance";

export const updateProduct = async (id, productData) => {
console.log("PUT productId:", id);
  console.log("Payload envoyé:", productData);
  const response = await axiosInstance.put(`/produits/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  if (!id) throw new Error("ID du produit manquant");
  const response = await axiosInstance.delete(`/produits/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosInstance.post("/produits", productData);
  return response.data;
};

export const getAllProductsAdmin = async () => {
  const response = await axiosInstance.get("/produits");
  return response.data;
};