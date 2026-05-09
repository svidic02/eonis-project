import { connect, set } from "mongoose";
import { UserModel } from "../models/user.model.js";
import { FoodModel } from "../models/food.model.js";
import { sample_users } from "../data.js";
import { sample_foods } from "../data.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const PASSWORD_HASH_SALT_ROUNDS = 10;
const MONGO_URI = process.env.MONGO_URI;

set("strictQuery", true);

export const dbconnect = async () => {
  try {
    connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await seedUsers();
    await seedFoods();
    console.log("DB connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

async function seedUsers() {
  const usersCount = await UserModel.countDocuments();
  if (usersCount > 0) {
    console.log("Users seed is already done!");
    return;
  }

  // await UserModel.deleteMany({});
  for (let user of sample_users) {
    user.password = await bcrypt.hash(user.password, PASSWORD_HASH_SALT_ROUNDS);
    await UserModel.create(user);
  }
  console.log("User seed is done!");
}

async function seedFoods() {
  const foodsCount = await FoodModel.countDocuments();
  if (foodsCount > 0) {
    console.log("Foods seed is already done!");
    return;
  }

  for (let food of sample_foods) {
    food.imageUrl = `/foods/${food.imageUrl}`;
    await FoodModel.create(food);
  }
  console.log("Foods seed is done!");
}
