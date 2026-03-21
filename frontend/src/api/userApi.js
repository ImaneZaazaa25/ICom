import axiosInstance from "./axiosInstance";

export const getProfil = async () => {
  const response = await axiosInstance.get("/user/profile");
  return response.data;
};

export const updateProfil = async (dto) => {
  const response = await axiosInstance.put("/user/profile", dto);
  return response.data;
};
