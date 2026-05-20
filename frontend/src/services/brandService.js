import axios from "axios";

export const getAllBrandsAdmin = async () => {
  const { data } = await axios.get("/api/brands");
  return data;
};

export const getBrandById = async (id) => {
  const { data } = await axios.get(`/api/brands`);
  return data.find((b) => b._id === id);
};

export const addBrand = async (payload) => {
  const { data } = await axios.post("/api/admin/brands", payload);
  return data;
};

export const editBrand = async (id, payload) => {
  const { data } = await axios.put(`/api/admin/brands/${id}`, payload);
  return data;
};

export const deleteBrand = async (id) => {
  const { data } = await axios.delete(`/api/admin/brands/${id}`);
  return data;
};
