import axios from "axios";

export const getAllFaqs = async () => {
  const { data } = await axios.get("/api/faqs");
  return data;
};

export const getFaqById = async (id) => {
  const { data } = await axios.get("/api/faqs");
  return data.find((f) => f._id === id);
};

export const addFaq = async (payload) => {
  const { data } = await axios.post("/api/admin/faqs", payload);
  return data;
};

export const editFaq = async (id, payload) => {
  const { data } = await axios.put(`/api/admin/faqs/${id}`, payload);
  return data;
};

export const deleteFaq = async (id) => {
  const { data } = await axios.delete(`/api/admin/faqs/${id}`);
  return data;
};
