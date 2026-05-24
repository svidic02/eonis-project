import axios from "axios";

export const createOrder = async (order) => {
  const { data } = await axios.post("/api/orders/create", order);
  return data;
};

export const pay = async (paymentId) => {
  const { data } = await axios.put("/api/orders/pay", { paymentId });
  return data;
};

export const getAllOrders = async () => {
  const { data } = await axios.get("/api/admin/orders");
  return data;
};

export const getMyOrders = async () => {
  const { data } = await axios.get("/api/orders/mine");
  return data;
};

export const getOrderById = async (id, token) => {
  const url = token ? `/api/orders/${id}?t=${encodeURIComponent(token)}` : `/api/orders/${id}`;
  const { data } = await axios.get(url);
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await axios.put(`/api/admin/orders/${id}/status`, { status });
  return data;
};
