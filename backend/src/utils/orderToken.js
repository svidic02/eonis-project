import jwt from "jsonwebtoken";

export const signOrderToken = (orderId) =>
  jwt.sign({ orderId: String(orderId) }, process.env.JWT_SECRET);

export const verifyOrderToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.orderId || null;
  } catch (_) {
    return null;
  }
};
