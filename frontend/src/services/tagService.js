import axios from "axios";

export const getAllTagsAdmin = async () => {
  const { data } = await axios.get("/api/tags");
  return data;
};

export const getTagById = async (id) => {
  const { data } = await axios.get(`/api/tags`);
  return data.find((t) => t._id === id);
};

export const addTag = async (payload) => {
  const { data } = await axios.post("/api/admin/tags", payload);
  return data;
};

export const editTag = async (id, payload) => {
  const { data } = await axios.put(`/api/admin/tags/${id}`, payload);
  return data;
};

export const deleteTag = async (id) => {
  const { data } = await axios.delete(`/api/admin/tags/${id}`);
  return data;
};
