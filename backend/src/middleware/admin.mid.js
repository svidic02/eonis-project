import { UNAUTHORIZED } from "../constants/httpStatus.js";

export default (req, res, next) => {
  if (!req.user) {
    return res.status(UNAUTHORIZED).send("Not authenticated");
  }

  if (!req.user.isAdmin) {
    return res.status(403).send("Admin access required");
  }

  next();
};
