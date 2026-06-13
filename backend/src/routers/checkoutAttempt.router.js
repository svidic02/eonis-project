import { Router } from "express";
import handler from "express-async-handler";
import { optionalAuth } from "../middleware/auth.mid.js";
import { CheckoutAttemptModel } from "../models/checkoutAttempt.model.js";

const router = Router();

router.post(
  "/",
  optionalAuth,
  handler(async (req, res) => {
    const { cartTotal, itemCount } = req.body;
    if (typeof cartTotal !== "number" || typeof itemCount !== "number") {
      return res.status(400).send("cartTotal and itemCount are required numbers");
    }
    if (itemCount <= 0) {
      return res.status(400).send("itemCount must be positive");
    }
    const attempt = await CheckoutAttemptModel.create({
      user: req.user?.id ?? null,
      cartTotal,
      itemCount,
    });
    res.send({ _id: attempt._id });
  })
);

export default router;
