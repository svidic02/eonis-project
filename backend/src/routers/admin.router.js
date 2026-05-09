import { Router } from "express";
import handler from "express-async-handler";
import auth from "../middleware/auth.mid.js";
import admin from "../middleware/admin.mid.js";
import { UserModel } from "../models/user.model.js";
import { FoodModel } from "../models/food.model.js";
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

// ==================== FOOD MANAGEMENT ====================

// Update food
router.put(
  "/foods/:foodId",
  handler(async (req, res) => {
    const { foodId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).send("Invalid food ID");
    }

    const data = req.body;
    const name = data.name;
    const price = data.price;
    const tags = data.tags;
    const time = data.cookTime;

    const updatedMeal = {
      name,
      price,
      tags,
      time,
    };

    const meal = await FoodModel.findByIdAndUpdate(
      { _id: foodId },
      updatedMeal,
      {
        new: true,
      }
    );

    if (!meal) {
      return res.status(404).send("Meal not found");
    }

    res.send(meal);
  })
);

// Delete food
router.delete(
  "/foods/:foodId",
  handler(async (req, res) => {
    const { foodId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).send("Invalid food ID");
    }

    const result = await FoodModel.findByIdAndDelete(foodId);
    if (!result) {
      return res.status(400).send("Food couldn't be deleted!");
    }

    res.send(result);
  })
);

// Add food
router.post(
  "/foods",
  handler(async (req, res) => {
    const { name, price, tags, cookTime, imageUrl } = req.body;

    const newMeal = {
      name,
      cookTime,
      price,
      imageUrl,
      tags,
    };

    const result = await FoodModel.create(newMeal);

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
