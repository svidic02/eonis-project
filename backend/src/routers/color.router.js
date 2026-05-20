import { Router } from "express";
import handler from "express-async-handler";
import { ColorModel } from "../models/color.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

router.get(
  "/",
  handler(async (req, res) => {
    const colors = await ColorModel.find({}).sort({ name: 1 }).lean();
    const counts = await ProductModel.aggregate([
      { $unwind: "$variants" },
      { $group: { _id: { product: "$_id", color: "$variants.color" } } },
      { $group: { _id: "$_id.color", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    const enriched = colors.map((c) => ({ ...c, count: countMap[c.name] ?? 0 }));
    res.send(enriched);
  })
);

export default router;
