import { connect, set } from "mongoose";
import { UserModel } from "../models/user.model.js";
import { ProductModel } from "../models/product.model.js";
import { TagModel } from "../models/tag.model.js";
import { ColorModel } from "../models/color.model.js";
import { BrandModel } from "../models/brand.model.js";
import { OrderModel } from "../models/order.model.js";
import { OrderStatus } from "../constants/orderStatus.js";
import { sample_users } from "../data.js";
import { sample_products } from "../data.js";
import { sample_tags } from "../data.js";
import { sample_colors } from "../data.js";
import { sample_brands } from "../data.js";
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
    await seedColors();
    await seedBrands();
    await seedOrders();
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

async function seedColors() {
  const colorsCount = await ColorModel.countDocuments();
  if (colorsCount > 0) {
    console.log("Colors seed is already done!");
    return;
  }
  for (let color of sample_colors) {
    await ColorModel.create(color);
  }
  console.log("Colors seed is done!");
}

async function seedBrands() {
  const brandsCount = await BrandModel.countDocuments();
  if (brandsCount > 0) {
    console.log("Brands seed is already done!");
    return;
  }
  for (let brand of sample_brands) {
    await BrandModel.create(brand);
  }
  console.log("Brands seed is done!");
}

async function seedOrders() {
  const ordersCount = await OrderModel.countDocuments();
  if (ordersCount > 0) {
    console.log("Orders seed is already done!");
    return;
  }
  const john = await UserModel.findOne({ email: "john@gmail.com" });
  const emily = await UserModel.findOne({ email: "emily@gmail.com" });
  const products = await ProductModel.find({}).limit(5);
  if (!john || !emily || products.length < 3) {
    console.log("Skipping orders seed (users or products missing).");
    return;
  }

  const buildItem = (product, qty = 1) => {
    const variant = (product.variants || []).find((v) => v.stock > 0) || product.variants?.[0];
    return {
      product,
      price: product.price * qty,
      quantity: qty,
      selectedColor: variant?.color ?? "Black",
      selectedSize: variant?.size ?? 42,
      sku: variant?.sku ?? `${product._id}-${variant?.color}-${variant?.size}`,
    };
  };

  const sample_orders = [
    {
      user: john._id,
      name: john.name,
      address: john.address,
      status: OrderStatus.PAYED,
      paymentId: "TEST-PAY-001",
      items: [buildItem(products[0], 1), buildItem(products[1], 2)],
      totalPrice: products[0].price + products[1].price * 2,
    },
    {
      user: john._id,
      name: john.name,
      address: john.address,
      status: OrderStatus.SHIPPED,
      paymentId: "TEST-PAY-002",
      items: [buildItem(products[2], 1)],
      totalPrice: products[2].price,
    },
    {
      user: emily._id,
      name: emily.name,
      address: emily.address,
      status: OrderStatus.PAYED,
      paymentId: "TEST-PAY-003",
      items: [buildItem(products[3], 1), buildItem(products[4], 1)],
      totalPrice: products[3].price + products[4].price,
    },
    {
      user: emily._id,
      name: emily.name,
      address: emily.address,
      status: OrderStatus.NEW,
      items: [buildItem(products[0], 1)],
      totalPrice: products[0].price,
    },
  ];

  for (const o of sample_orders) await OrderModel.create(o);
  console.log("Orders seed is done!");
}
