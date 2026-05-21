import axios from "axios";

export const validatePromo = async ({ code, subtotal }) => {
  const { data } = await axios.post("/api/promos/validate", { code, subtotal });
  return data;
};

export const getAllPromosAdmin = async () => {
  const { data } = await axios.get("/api/admin/promos");
  return data;
};

export const getPromoById = async (id) => {
  const { data } = await axios.get("/api/admin/promos");
  return data.find((p) => p._id === id);
};

export const addPromo = async (payload) => {
  const { data } = await axios.post("/api/admin/promos", payload);
  return data;
};

export const editPromo = async (id, payload) => {
  const { data } = await axios.put(`/api/admin/promos/${id}`, payload);
  return data;
};

export const deletePromo = async (id) => {
  const { data } = await axios.delete(`/api/admin/promos/${id}`);
  return data;
};
