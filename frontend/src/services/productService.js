import axios from "axios";

export const getAll = async (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  const { data } = await axios.get("/api/products" + (qs ? `?${qs}` : ""));
  return data;
};
export const getAllTags = async () => {
  const { data } = await axios.get("/api/products/tags");
  return data;
};
export const search = async (searchTerm) => {
  const { data } = await axios.get("/api/products/search/" + searchTerm);
  return data;
};
export const getAllByTag = async (tag) => {
  if (tag === "All") return getAll();
  const { data } = await axios.get("/api/products/tag/" + tag);
  return data;
};
export const getById = async (productId) => {
  const { data } = await axios.get(`/api/products/${productId}`);
  return data;
};

export const edit = async (productData) => {
  const { data } = await axios.put(
    `/api/admin/products/${productData.id}`,
    productData
  );
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await axios.delete(`/api/admin/products/${id}`);
  return data;
};

export const addProduct = async (product) => {
  const fullProduct = { ...product, imageUrl: `/products/image-1.jpg` };
  const { data } = await axios.post(`/api/admin/products`, fullProduct);
  return data;
};
