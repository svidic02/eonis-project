import { connect, set } from "mongoose";
import { UserModel } from "../models/user.model.js";
import { ProductModel } from "../models/product.model.js";
import { TagModel } from "../models/tag.model.js";
import { ColorModel } from "../models/color.model.js";
import { BrandModel } from "../models/brand.model.js";
import { OrderModel } from "../models/order.model.js";
import { PromoModel } from "../models/promo.model.js";
import { OrderStatus } from "../constants/orderStatus.js";
import { SHIPPING_FEE, FREE_SHIPPING_OVER } from "../constants/shipping.js";
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
    await seedPromos();
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

  const buildOrder = (overrides) => {
    const items = overrides.items;
    const subtotal = items.reduce((s, it) => s + it.price, 0);
    const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
    const paymentMethod =
      overrides.paymentMethod ??
      ([OrderStatus.PAYED, OrderStatus.SHIPPED].includes(overrides.status) ? "PAYPAL" : "COD");
    return {
      ...overrides,
      items,
      subtotal,
      shipping,
      discount: 0,
      promoCode: null,
      totalPrice: subtotal + shipping,
      paymentMethod,
    };
  };

  const sample_orders = [
    buildOrder({
      user: john._id,
      name: john.name,
      address: john.address,
      status: OrderStatus.PAYED,
      paymentId: "TEST-PAY-001",
      items: [buildItem(products[0], 1), buildItem(products[1], 2)],
    }),
    buildOrder({
      user: john._id,
      name: john.name,
      address: john.address,
      status: OrderStatus.SHIPPED,
      paymentId: "TEST-PAY-002",
      items: [buildItem(products[2], 1)],
    }),
    buildOrder({
      user: emily._id,
      name: emily.name,
      address: emily.address,
      status: OrderStatus.PAYED,
      paymentId: "TEST-PAY-003",
      items: [buildItem(products[3], 1), buildItem(products[4], 1)],
    }),
    buildOrder({
      user: emily._id,
      name: emily.name,
      address: emily.address,
      status: OrderStatus.NEW,
      items: [buildItem(products[0], 1)],
    }),
  ];

  for (const o of sample_orders) await OrderModel.create(o);
  console.log("Orders seed is done!");
}

async function seedPromos() {
  const count = await PromoModel.countDocuments();
  if (count > 0) {
    console.log("Promos seed is already done!");
    return;
  }
  const sample_promos = [
    { code: "WELCOME10", type: "PERCENT", value: 10, minSubtotal: 0, active: true },
    { code: "EONIS500", type: "FIXED", value: 500, minSubtotal: 5000, active: true },
    { code: "SUMMER20", type: "PERCENT", value: 20, minSubtotal: 15000, active: true },
    { code: "BIGSPEND", type: "FIXED", value: 5000, minSubtotal: 30000, active: true },
    { code: "FREESHIP", type: "FIXED", value: 500, minSubtotal: 0, active: true },
    { code: "STUDENT15", type: "PERCENT", value: 15, minSubtotal: 0, active: true },
    { code: "BLACKFRI", type: "PERCENT", value: 30, minSubtotal: 20000, active: false },
  ];
  for (const p of sample_promos) await PromoModel.create(p);
  console.log("Promos seed is done!");
}
