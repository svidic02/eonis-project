import jwt from "jsonwebtoken";
import { UNAUTHORIZED } from "../constants/httpStatus.js";

const auth = (req, res, next) => {
  const token = req.headers.access_token;
  if (!token) {
    return res.status(UNAUTHORIZED).send();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(UNAUTHORIZED).send();
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  const token = req.headers.access_token;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      // ignore — treat as guest
    }
  }
  next();
};

export default auth;
