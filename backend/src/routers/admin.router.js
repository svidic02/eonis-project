import { Router } from "express";
import handler from "express-async-handler";
import auth from "../middleware/auth.mid.js";
import admin from "../middleware/admin.mid.js";
import { UserModel } from "../models/user.model.js";
import { ProductModel } from "../models/product.model.js";
import { OrderModel } from "../models/order.model.js";
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

    const hashedPassword = await bcrypt.hash(
      password,
      PASSWORD_HASH_SALT_ROUNDS
    );

    const updatedUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      isAdmin,
    };

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
      }
    );

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
    const { name, brand, category, description, price, tags, images, variants } =
      req.body;

    const newProduct = {
      name,
      brand,
      category,
      description,
      price,
      tags,
      images,
      variants,
    };

    const result = await ProductModel.create(newProduct);

    res.send(result);
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
