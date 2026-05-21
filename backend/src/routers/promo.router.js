import { Router } from "express";
import handler from "express-async-handler";
import { PromoModel } from "../models/promo.model.js";

const router = Router();

router.post(
  "/validate",
  handler(async (req, res) => {
    const { code, subtotal } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).send("Code is required");
    }
    const sub = Number(subtotal) || 0;
    const promo = await PromoModel.findOne({
      code: code.trim().toUpperCase(),
      active: true,
    });
    if (!promo) return res.status(404).send("Promo code not found");
    if (sub < promo.minSubtotal) {
      return res.status(400).send(`Subtotal must be at least ${promo.minSubtotal}`);
    }
    const raw = promo.type === "PERCENT"
      ? Math.round((sub * promo.value) / 100)
      : promo.value;
    const discount = Math.min(raw, sub);
    res.send({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minSubtotal: promo.minSubtotal,
      discount,
    });
  })
);

export default router;
