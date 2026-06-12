import { Router } from "express";
import handler from "express-async-handler";
import { FaqModel } from "../models/faq.model.js";

const router = Router();

router.get(
  "/",
  handler(async (req, res) => {
    const faqs = await FaqModel.find({}).sort({ order: 1, createdAt: 1 }).lean();
    res.send(faqs);
  })
);

export default router;
