import axios from "axios";

export const trackCheckoutAttempt = async (payload) => {
  try {
    await axios.post("/api/checkout-attempts", payload);
  } catch {
    // Fire-and-forget — never block checkout on a tracking failure.
  }
};

export const getAllCheckoutAttempts = async () => {
  const { data } = await axios.get("/api/admin/checkout-attempts");
  return data;
};
