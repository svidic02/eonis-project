import { Router } from "express";
import handler from "express-async-handler";
import auth from "../middleware/auth.mid.js";
import admin from "../middleware/admin.mid.js";
import { UserModel } from "../models/user.model.js";
import { ProductModel } from "../models/product.model.js";
import { OrderModel } from "../models/order.model.js";
import { TagModel } from "../models/tag.model.js";
import { ColorModel } from "../models/color.model.js";
import { BrandModel } from "../models/brand.model.js";
import { PromoModel } from "../models/promo.model.js";
import { FaqModel } from "../models/faq.model.js";
import { CheckoutAttemptModel } from "../models/checkoutAttempt.model.js";
import { OrderStatus } from "../constants/orderStatus.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import JWT from "jsonwebtoken";

const router = Router();
const PASSWORD_HASH_SALT_ROUNDS = 10;

// Apply auth and admin middleware to ALL routes in this file
router.use(auth);
router.use(admin);

// ==================== USER MANAGEMENT ====================

// Get all users
router.get(
  "/users",
  handler(async (req, res) => {
    const users = await UserModel.find();
    res.send(users);
  })
);

// Get user by ID
router.get(
  "/users/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid user ID");
    }
    const user = await UserModel.findById(id);
    res.send(user);
  })
);

// Update user
router.put(
  "/users/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid user ID");
    }

    const data = req.body;
    const name = data.name;
    const email = data.email;
    const password = data.password;
    const address = data.address;
    const isAdmin = data.isAdmin;

    const updatedUser = {
      name,
      email: email.toLowerCase(),
      address,
      isAdmin,
    };

    if (password) {
      updatedUser.password = await bcrypt.hash(
        password,
        PASSWORD_HASH_SALT_ROUNDS
      );
    }

    const user = await UserModel.findByIdAndUpdate({ _id: id }, updatedUser, {
      new: true,
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(generateTokenResponse(user));
  })
);

// Delete user
router.delete(
  "/users/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid user ID");
    }

    const result = await UserModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(400).send("User couldn't be deleted!");
    }

    res.send(result);
  })
);

// ==================== PRODUCT MANAGEMENT ====================

// Update product
router.put(
  "/products/:productId",
  handler(async (req, res) => {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }

    const data = req.body;
    const updatedProduct = {
      name: data.name,
      brand: data.brand,
      gender: data.gender,
      category: data.category,
      description: data.description,
      price: data.price,
      tags: data.tags,
      images: data.images,
      variants: data.variants,
    };

    // Strip undefined fields so PUT only overwrites what was sent
    Object.keys(updatedProduct).forEach(
      (k) => updatedProduct[k] === undefined && delete updatedProduct[k]
    );

    const product = await ProductModel.findByIdAndUpdate(
      { _id: productId },
      updatedProduct,
      {
        new: true,
        runValidators: true,
      }
    ).catch((err) => {
      if (err.name === "ValidationError") {
        const msg = Object.values(err.errors).map((e) => e.message).join("; ");
        res.status(400).send(msg);
        return null;
      }
      throw err;
    });
    if (res.headersSent) return;

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.send(product);
  })
);

// Replace variants for a product
router.put(
  "/products/:productId/variants",
  handler(async (req, res) => {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }
    const { variants } = req.body;
    if (!Array.isArray(variants)) {
      return res.status(400).send("variants must be an array");
    }

    const product = await ProductModel.findById(productId);
    if (!product) return res.status(404).send("Product not found");
    product.variants = variants;
    await product.save();
    res.send(product);
  })
);

// Delete product
router.delete(
  "/products/:productId",
  handler(async (req, res) => {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }

    const result = await ProductModel.findByIdAndDelete(productId);
    if (!result) {
      return res.status(400).send("Product couldn't be deleted!");
    }

    res.send(result);
  })
);

// Add product
router.post(
  "/products",
  handler(async (req, res) => {
    const { name, brand, gender, category, description, price, tags, images, variants } =
      req.body;

    const newProduct = {
      name,
      brand,
      gender,
      category,
      description,
      price,
      tags,
      images,
      variants,
    };

    try {
      const result = await ProductModel.create(newProduct);
      res.send(result);
    } catch (err) {
      if (err.name === "ValidationError") {
        const msg = Object.values(err.errors).map((e) => e.message).join("; ");
        return res.status(400).send(msg);
      }
      throw err;
    }
  })
);

// ==================== ORDER MANAGEMENT ====================

// Get all orders
router.get(
  "/orders",
  handler(async (req, res) => {
    const orders = await OrderModel.find();
    res.send(orders);
  })
);

router.put(
  "/orders/:id/status",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid order ID");
    }
    const { status } = req.body;
    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).send("Invalid status");
    }
    const order = await OrderModel.findById(id);
    if (!order) return res.status(404).send("Order not found");
    if (order.status === status) return res.send(order);
    order.status = status;
    await order.save();
    res.send(order);
  })
);

// ==================== TAG MANAGEMENT ====================

router.post(
  "/tags",
  handler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).send("Name is required");
    const trimmed = name.trim();
    const existing = await TagModel.findOne({ name: trimmed });
    if (existing) return res.status(409).send("Tag already exists");
    const tag = await TagModel.create({ name: trimmed, description });
    res.send(tag);
  })
);

router.put(
  "/tags/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid tag ID");
    }
    const { name, description } = req.body;
    const trimmed = name?.trim();
    if (!trimmed) return res.status(400).send("Name is required");

    const existing = await TagModel.findById(id);
    if (!existing) return res.status(404).send("Tag not found");

    const collision = await TagModel.findOne({ name: trimmed, _id: { $ne: id } });
    if (collision) return res.status(409).send("A tag with that name already exists");

    const oldName = existing.name;
    existing.name = trimmed;
    if (description !== undefined) existing.description = description;
    await existing.save();

    if (oldName !== trimmed) {
      await ProductModel.updateMany(
        { tags: oldName },
        { $set: { "tags.$[el]": trimmed } },
        { arrayFilters: [{ el: oldName }] }
      );
    }

    res.send(existing);
  })
);

router.delete(
  "/tags/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid tag ID");
    }
    const tag = await TagModel.findByIdAndDelete(id);
    if (!tag) return res.status(404).send("Tag not found");
    await ProductModel.updateMany({ tags: tag.name }, { $pull: { tags: tag.name } });
    res.send(tag);
  })
);

// ==================== COLOR MANAGEMENT ====================

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

router.post(
  "/colors",
  handler(async (req, res) => {
    const { name, hex } = req.body;
    if (!name || !name.trim()) return res.status(400).send("Name is required");
    if (!hex || !HEX_RE.test(hex))
      return res.status(400).send("Hex must be in #RRGGBB format");
    const trimmed = name.trim();
    const existing = await ColorModel.findOne({ name: trimmed });
    if (existing) return res.status(409).send("Color already exists");
    const color = await ColorModel.create({ name: trimmed, hex });
    res.send(color);
  })
);

router.put(
  "/colors/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid color ID");
    }
    const { name, hex } = req.body;
    const trimmed = name?.trim();
    if (!trimmed) return res.status(400).send("Name is required");
    if (!hex || !HEX_RE.test(hex))
      return res.status(400).send("Hex must be in #RRGGBB format");

    const existing = await ColorModel.findById(id);
    if (!existing) return res.status(404).send("Color not found");

    const collision = await ColorModel.findOne({ name: trimmed, _id: { $ne: id } });
    if (collision) return res.status(409).send("A color with that name already exists");

    const oldName = existing.name;
    existing.name = trimmed;
    existing.hex = hex;
    await existing.save();

    if (oldName !== trimmed) {
      await ProductModel.updateMany(
        { "variants.color": oldName },
        { $set: { "variants.$[v].color": trimmed } },
        { arrayFilters: [{ "v.color": oldName }] }
      );
    }

    res.send(existing);
  })
);

router.delete(
  "/colors/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid color ID");
    }
    const color = await ColorModel.findById(id);
    if (!color) return res.status(404).send("Color not found");

    const inUse = await ProductModel.exists({ "variants.color": color.name });
    if (inUse) {
      return res
        .status(409)
        .send("Color is in use by one or more product variants. Remove or rename those variants first.");
    }

    await color.deleteOne();
    res.send(color);
  })
);

// ==================== BRAND MANAGEMENT ====================

router.post(
  "/brands",
  handler(async (req, res) => {
    const { name, logoUrl } = req.body;
    if (!name || !name.trim()) return res.status(400).send("Name is required");
    const trimmed = name.trim();
    const existing = await BrandModel.findOne({ name: trimmed });
    if (existing) return res.status(409).send("Brand already exists");
    const brand = await BrandModel.create({ name: trimmed, logoUrl: logoUrl ?? "" });
    res.send(brand);
  })
);

router.put(
  "/brands/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid brand ID");
    }
    const { name, logoUrl } = req.body;
    const trimmed = name?.trim();
    if (!trimmed) return res.status(400).send("Name is required");

    const existing = await BrandModel.findById(id);
    if (!existing) return res.status(404).send("Brand not found");

    const collision = await BrandModel.findOne({ name: trimmed, _id: { $ne: id } });
    if (collision) return res.status(409).send("A brand with that name already exists");

    const oldName = existing.name;
    existing.name = trimmed;
    if (logoUrl !== undefined) existing.logoUrl = logoUrl;
    await existing.save();

    if (oldName !== trimmed) {
      await ProductModel.updateMany(
        { brand: oldName },
        { $set: { brand: trimmed } }
      );
    }

    res.send(existing);
  })
);

router.delete(
  "/brands/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid brand ID");
    }
    const brand = await BrandModel.findById(id);
    if (!brand) return res.status(404).send("Brand not found");

    const inUse = await ProductModel.exists({ brand: brand.name });
    if (inUse) {
      return res
        .status(409)
        .send("Brand is in use by one or more products. Reassign those products first.");
    }

    await brand.deleteOne();
    res.send(brand);
  })
);

// ==================== PROMO MANAGEMENT ====================

router.get(
  "/promos",
  handler(async (req, res) => {
    const promos = await PromoModel.find({}).sort({ code: 1 });
    res.send(promos);
  })
);

router.post(
  "/promos",
  handler(async (req, res) => {
    const { code, type, value, minSubtotal, active } = req.body;
    if (!code || !code.trim()) return res.status(400).send("Code is required");
    if (!["PERCENT", "FIXED"].includes(type)) return res.status(400).send("Invalid type");
    const trimmed = code.trim().toUpperCase();
    const existing = await PromoModel.findOne({ code: trimmed });
    if (existing) return res.status(409).send("Promo code already exists");
    try {
      const promo = await PromoModel.create({
        code: trimmed,
        type,
        value,
        minSubtotal: minSubtotal ?? 0,
        active: active ?? true,
      });
      res.send(promo);
    } catch (err) {
      if (err.name === "ValidationError") {
        const msg = Object.values(err.errors).map((e) => e.message).join("; ");
        return res.status(400).send(msg);
      }
      throw err;
    }
  })
);

router.put(
  "/promos/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid promo ID");
    }
    const { code, type, value, minSubtotal, active } = req.body;
    const existing = await PromoModel.findById(id);
    if (!existing) return res.status(404).send("Promo not found");

    if (code !== undefined) {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return res.status(400).send("Code is required");
      const collision = await PromoModel.findOne({ code: trimmed, _id: { $ne: id } });
      if (collision) return res.status(409).send("A promo with that code already exists");
      existing.code = trimmed;
    }
    if (type !== undefined) {
      if (!["PERCENT", "FIXED"].includes(type)) return res.status(400).send("Invalid type");
      existing.type = type;
    }
    if (value !== undefined) existing.value = value;
    if (minSubtotal !== undefined) existing.minSubtotal = minSubtotal;
    if (active !== undefined) existing.active = active;

    try {
      await existing.save();
      res.send(existing);
    } catch (err) {
      if (err.name === "ValidationError") {
        const msg = Object.values(err.errors).map((e) => e.message).join("; ");
        return res.status(400).send(msg);
      }
      throw err;
    }
  })
);

router.delete(
  "/promos/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid promo ID");
    }
    const promo = await PromoModel.findByIdAndDelete(id);
    if (!promo) return res.status(404).send("Promo not found");
    res.send(promo);
  })
);

// ==================== FAQ MANAGEMENT ====================

router.post(
  "/faqs",
  handler(async (req, res) => {
    const { question, answer, order } = req.body;
    if (!question || !question.trim()) return res.status(400).send("Question is required");
    if (!answer || !answer.trim()) return res.status(400).send("Answer is required");
    const trimmedQ = question.trim();
    const existing = await FaqModel.findOne({ question: trimmedQ });
    if (existing) return res.status(409).send("An FAQ with that question already exists");
    try {
      const faq = await FaqModel.create({
        question: trimmedQ,
        answer: answer.trim(),
        order: order ?? 0,
      });
      res.send(faq);
    } catch (err) {
      if (err.name === "ValidationError") {
        const msg = Object.values(err.errors).map((e) => e.message).join("; ");
        return res.status(400).send(msg);
      }
      throw err;
    }
  })
);

router.put(
  "/faqs/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid FAQ ID");
    }
    const { question, answer, order } = req.body;
    const existing = await FaqModel.findById(id);
    if (!existing) return res.status(404).send("FAQ not found");

    if (question !== undefined) {
      const trimmed = question.trim();
      if (!trimmed) return res.status(400).send("Question is required");
      const collision = await FaqModel.findOne({ question: trimmed, _id: { $ne: id } });
      if (collision) return res.status(409).send("An FAQ with that question already exists");
      existing.question = trimmed;
    }
    if (answer !== undefined) {
      const trimmed = answer.trim();
      if (!trimmed) return res.status(400).send("Answer is required");
      existing.answer = trimmed;
    }
    if (order !== undefined) existing.order = order;

    try {
      await existing.save();
      res.send(existing);
    } catch (err) {
      if (err.name === "ValidationError") {
        const msg = Object.values(err.errors).map((e) => e.message).join("; ");
        return res.status(400).send(msg);
      }
      throw err;
    }
  })
);

router.delete(
  "/faqs/:id",
  handler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid FAQ ID");
    }
    const faq = await FaqModel.findByIdAndDelete(id);
    if (!faq) return res.status(404).send("FAQ not found");
    res.send(faq);
  })
);

// ==================== CHECKOUT ATTEMPTS ====================

router.get(
  "/checkout-attempts",
  handler(async (req, res) => {
    const attempts = await CheckoutAttemptModel.find().sort({ createdAt: -1 });
    res.send(attempts);
  })
);

// ==================== HELPER FUNCTIONS ====================

const generateTokenResponse = (user) => {
  const token = JWT.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token,
  };
};

export default router;
