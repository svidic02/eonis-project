import { connect, set } from "mongoose";
import { UserModel } from "../models/user.model.js";
import { ProductModel } from "../models/product.model.js";
import { TagModel } from "../models/tag.model.js";
import { sample_users } from "../data.js";
import { sample_products } from "../data.js";
import { sample_tags } from "../data.js";
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
    await seedProducts();
    await seedTags();
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

async function seedProducts() {
  const productsCount = await ProductModel.countDocuments();
  if (productsCount > 0) {
    console.log("Products seed is already done!");
    return;
  }

  for (let product of sample_products) {
    product.images = (product.images ?? []).map((img) => `/products/${img}`);
    await ProductModel.create(product);
  }
  console.log("Products seed is done!");
}

async function seedTags() {
  const tagsCount = await TagModel.countDocuments();
  if (tagsCount > 0) {
    console.log("Tags seed is already done!");
    return;
  }
  for (let tag of sample_tags) {
    if (tag.name === "All") continue;
    await TagModel.create({ name: tag.name });
  }
  console.log("Tags seed is done!");
}
