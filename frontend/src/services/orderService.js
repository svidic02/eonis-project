import axios from "axios";

export const createOrder = async (order) => {
  // if (!order) {
  //   console.log("SERVICE : Order is invalid.Order:" + order);
  // } else {
  //   console.log("SERVICE : Order is valid before request is sent!Order is:" + order);
  // }
  try {
    const { data } = axios.post("/api/orders/create", order);

    // if (data.items != 0) {
    //   console.log("SERVICE : Data is invalid.Order:\n" + data);
    // } else {
    //   console.log("SERVICE : Data recieved is valid!Data:" + data);
    // }

    return data;
  } catch (error) {}
};

export const getNewOrderForCurrentUser = async () => {
  const { data } = await axios.get("/api/orders/newOrderForCurrentUser");
  return data;
};

export const pay = async (paymentId) => {
  try {
    const { data } = await axios.put("/api/orders/pay", { paymentId });
    return data;
  } catch (error) {}
};

export const getAllOrders = async () => {
  const { data } = await axios.get("/api/orders");
  return data;
};
