import { Router } from "express";
import handler from "express-async-handler";
import { BrandModel } from "../models/brand.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

router.get(
  "/",
  handler(async (req, res) => {
    const brands = await BrandModel.find({}).sort({ name: 1 }).lean();
    const counts = await ProductModel.aggregate([
      { $match: { brand: { $ne: null } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    const enriched = brands.map((b) => ({ ...b, count: countMap[b.name] ?? 0 }));
    res.send(enriched);
  })
);

export default router;
