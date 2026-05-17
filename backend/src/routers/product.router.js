import { Router } from "express";
import { ProductModel } from "../models/product.model.js";
import handler from "express-async-handler";

const router = Router();

router.get(
  "/",
  handler(async (req, res) => {
    const products = await ProductModel.find({});
    res.send(products);
  })
);

router.get(
  "/tags",
  handler(async (req, res) => {
    const tags = await ProductModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: "$count" } },
    ]).sort({ count: -1 });

    const all = {
      name: "All",
      count: await ProductModel.countDocuments(),
    };
    tags.unshift(all);

    res.send(tags);
  })
);

router.get(
  "/search/:searchTerm",
  handler(async (req, res) => {
    const { searchTerm } = req.params;
    const searchRegex = new RegExp(searchTerm, "i");
    const products = await ProductModel.find({ name: { $regex: searchRegex } });
    res.send(products);
  })
);

router.get(
  "/tag/:tag",
  handler(async (req, res) => {
    const { tag } = req.params;
    const products = await ProductModel.find({ tags: tag });
    res.send(products);
  })
);

router.get(
  "/:productId",
  handler(async (req, res) => {
    const { productId } = req.params;
    const product = await ProductModel.findById(productId);
    res.send(product);
  })
);

router.get(
  "/:productId/variants",
  handler(async (req, res) => {
    const { productId } = req.params;
    const product = await ProductModel.findById(productId, "variants");
    if (!product) return res.status(404).send("Product not found");
    res.send(product.variants);
  })
);

export default router;
