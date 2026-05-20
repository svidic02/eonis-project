import axios from "axios";

export const getAllColorsAdmin = async () => {
  const { data } = await axios.get("/api/colors");
  return data;
};

export const getColorById = async (id) => {
  const { data } = await axios.get(`/api/colors`);
  return data.find((c) => c._id === id);
};

export const addColor = async (payload) => {
  const { data } = await axios.post("/api/admin/colors", payload);
  return data;
};

export const editColor = async (id, payload) => {
  const { data } = await axios.put(`/api/admin/colors/${id}`, payload);
  return data;
};

export const deleteColor = async (id) => {
  const { data } = await axios.delete(`/api/admin/colors/${id}`);
  return data;
};
