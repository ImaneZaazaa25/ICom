import axios from "axios";

export const loadImageWithAuth = async (url) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: "blob"
    });

    return URL.createObjectURL(response.data);

  } catch (error) {
    console.error("Erreur chargement image:", error);
    return null;
  }
};