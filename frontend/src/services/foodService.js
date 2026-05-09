import axios from "axios";

export const getAll = async () => {
  const { data } = await axios.get("api/foods");
  return data;
};
export const getAllTags = async () => {
  const { data } = await axios.get("api/foods/tags");
  return data;
};
export const search = async (searchTerm) => {
  const { data } = await axios.get("api/foods/search/" + searchTerm);
  return data;
};
export const getAllByTag = async (tag) => {
  if (tag === "All") return getAll();
  const { data } = await axios.get("api/foods/tag/" + tag);
  return data;
};
export const getById = async (foodId) => {
  const { data } = await axios.get(`api/foods/${foodId}`);
  return data;
};

export const edit = async (foodData) => {
  const { data } = await axios.put(`api/foods/${foodData.id}`, foodData);
  return data;
};

export const deleteMeal = async (id) => {
  const { data } = await axios.delete(`api/foods/${id}`);
  return data;
};

export const addMeal = async (meal) => {
  const fullMeal = { ...meal, imageUrl: `/foods/image-1.jpg` };
  const { data } = await axios.post(`api/foods/addFood`, fullMeal);
  return data;
};
