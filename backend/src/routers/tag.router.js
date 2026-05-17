import { Router } from "express";
import handler from "express-async-handler";
import { TagModel } from "../models/tag.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

router.get(
  "/",
  handler(async (req, res) => {
    const tags = await TagModel.find({}).sort({ name: 1 }).lean();
    const counts = await ProductModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    const enriched = tags.map((t) => ({ ...t, count: countMap[t.name] ?? 0 }));
    res.send(enriched);
  })
);

export default router;
