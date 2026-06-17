import { connect, set } from "mongoose";
import { UserModel } from "../models/user.model.js";
import { ProductModel } from "../models/product.model.js";
import { TagModel } from "../models/tag.model.js";
import { ColorModel } from "../models/color.model.js";
import { BrandModel } from "../models/brand.model.js";
import { OrderModel } from "../models/order.model.js";
import { PromoModel } from "../models/promo.model.js";
import { FaqModel } from "../models/faq.model.js";
import { CheckoutAttemptModel } from "../models/checkoutAttempt.model.js";
import { OrderStatus } from "../constants/orderStatus.js";
import { SHIPPING_FEE, FREE_SHIPPING_OVER } from "../constants/shipping.js";
import { sample_users } from "../data.js";
import { sample_products } from "../data.js";
import { sample_tags } from "../data.js";
import { sample_colors } from "../data.js";
import { sample_brands } from "../data.js";
import { sample_faqs } from "../data.js";
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
    await seedFaqs();
    await seedCheckoutAttempts();
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
    product.images = (product.images ?? []).map((img) =>
      /^https?:\/\//i.test(img) ? img : `/products/${img}`
    );
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
  const userEmails = [
    "john@gmail.com",
    "emily@gmail.com",
    "sophia@gmail.com",
    "alex@gmail.com",
    "olivia@gmail.com",
  ];
  const users = await UserModel.find({ email: { $in: userEmails } });
  const products = await ProductModel.find({});
  if (users.length < 2 || products.length < 5) {
    console.log("Skipping orders seed (users or products missing).");
    return;
  }
  const userByEmail = Object.fromEntries(users.map((u) => [u.email, u]));

  const buildItem = (product, qty, variantIdx = 0) => {
    const variants = (product.variants || []).filter((v) => v.stock > 0);
    const variant = variants[variantIdx % Math.max(1, variants.length)] ?? product.variants?.[0];
    return {
      product,
      price: product.price * qty,
      quantity: qty,
      selectedColor: variant?.color ?? "Black",
      selectedSize: variant?.size ?? 42,
      sku: variant?.sku ?? `${product._id}-${variant?.color}-${variant?.size}`,
    };
  };

  const productByName = Object.fromEntries(products.map((p) => [p.name, p]));
  const P = (name) => {
    const p = productByName[name];
    if (!p) throw new Error(`Seed: missing product "${name}"`);
    return p;
  };

  const NEW = OrderStatus.NEW;
  const COD = OrderStatus.COD_PENDING;
  const PAYED = OrderStatus.PAYED;
  const SHIPPED = OrderStatus.SHIPPED;
  const CANCELED = OrderStatus.CANCELED;

  const fixtures = [
    { ago: 28, email: "john@gmail.com",   status: SHIPPED, items: [["Air Max 90", 1, 1], ["Stan Smith", 1, 0]] },
    { ago: 26, email: "emily@gmail.com",  status: SHIPPED, items: [["Gel-Kayano 30", 1, 0]] },
    { ago: 25, email: "sophia@gmail.com", status: SHIPPED, items: [["Chuck 70", 2, 1]] },
    { ago: 23, email: "alex@gmail.com",   status: SHIPPED, items: [["Pegasus 40", 1, 2], ["Performance Slide", 1, 0]] },
    { ago: 21, email: "olivia@gmail.com", status: PAYED,   items: [["Arizona", 1, 0]], promo: "WELCOME10" },
    { ago: 20, email: "john@gmail.com",   status: SHIPPED, items: [["1460", 1, 1]] },
    { ago: 19, email: "emily@gmail.com",  status: PAYED,   items: [["Court Pump", 1, 2]] },
    { ago: 18, email: "sophia@gmail.com", status: CANCELED,items: [["Tilden Cap Oxford", 1, 0]] },
    { ago: 17, email: "alex@gmail.com",   status: PAYED,   items: [["6-Inch Premium", 1, 1], ["Penny Loafer", 1, 0]] },
    { ago: 15, email: "olivia@gmail.com", status: PAYED,   items: [["Old Skool Kids", 2, 0]] },
    { ago: 14, email: "john@gmail.com",   status: PAYED,   items: [["Trailblazer Kids", 1, 1], ["Court Trainer Kids", 1, 0]] },
    { ago: 12, email: "emily@gmail.com",  status: PAYED,   items: [["Jadon", 1, 1]] },
    { ago: 11, email: "sophia@gmail.com", status: PAYED,   items: [["Splash Sandal", 1, 1]] },
    { ago: 10, email: "alex@gmail.com",   status: PAYED,   items: [["Air Max 90", 1, 0], ["Performance Slide", 2, 0]] },
    { ago: 9,  email: "olivia@gmail.com", status: NEW,     items: [["Pegasus 40", 1, 1]] },
    { ago: 8,  email: "john@gmail.com",   status: COD,     items: [["Stan Smith", 1, 2]] },
    { ago: 6,  email: "emily@gmail.com",  status: PAYED,   items: [["Gel-Kayano 30", 1, 1], ["Chuck 70", 1, 0]], promo: "SUMMER20" },
    { ago: 5,  email: "sophia@gmail.com", status: PAYED,   items: [["Court Pump", 1, 0]] },
    { ago: 4,  email: "alex@gmail.com",   status: PAYED,   items: [["Penny Loafer", 1, 1]] },
    { ago: 3,  email: "olivia@gmail.com", status: SHIPPED, items: [["Arizona", 1, 1], ["Splash Sandal", 1, 0]] },
    { ago: 3,  email: "john@gmail.com",   status: PAYED,   items: [["1460", 1, 0], ["Air Max 90", 1, 2]] },
    { ago: 2,  email: "emily@gmail.com",  status: PAYED,   items: [["Old Skool Kids", 1, 1], ["Trailblazer Kids", 1, 0]] },
    { ago: 2,  email: "sophia@gmail.com", status: NEW,     items: [["Jadon", 1, 0]] },
    { ago: 1,  email: "alex@gmail.com",   status: COD,     items: [["6-Inch Premium", 1, 0]] },
    { ago: 1,  email: "olivia@gmail.com", status: PAYED,   items: [["Court Trainer Kids", 1, 2], ["Performance Slide", 1, 1]] },
  ];

  const DAY_MS = 24 * 60 * 60 * 1000;
  const promoConfigs = {
    WELCOME10: { type: "PERCENT", value: 10 },
    SUMMER20:  { type: "PERCENT", value: 20 },
  };

  const sample_orders = fixtures.map((f, idx) => {
    const user = userByEmail[f.email];
    const items = f.items.map(([name, qty, vIdx]) => buildItem(P(name), qty, vIdx));
    const subtotal = items.reduce((s, it) => s + it.price, 0);
    let discount = 0;
    let promoCode = null;
    if (f.promo && promoConfigs[f.promo]) {
      const cfg = promoConfigs[f.promo];
      discount = cfg.type === "PERCENT" ? Math.round((subtotal * cfg.value) / 100) : cfg.value;
      promoCode = f.promo;
    }
    const shipping = subtotal - discount >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
    const paymentMethod = [PAYED, SHIPPED].includes(f.status) ? "PAYPAL" : "COD";
    const createdAt = new Date(Date.now() - f.ago * DAY_MS);
    return {
      user: user._id,
      name: user.name,
      address: user.address,
      status: f.status,
      paymentId: paymentMethod === "PAYPAL" ? `SEED-PAY-${String(idx + 1).padStart(3, "0")}` : "",
      paymentMethod,
      items,
      subtotal,
      shipping,
      discount,
      promoCode,
      totalPrice: subtotal + shipping - discount,
      createdAt,
      updatedAt: createdAt,
    };
  });

  await OrderModel.insertMany(sample_orders, { timestamps: false });
  console.log(`Orders seed is done! (${sample_orders.length} orders)`);
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

async function seedFaqs() {
  const count = await FaqModel.countDocuments();
  if (count > 0) {
    console.log("FAQs seed is already done!");
    return;
  }
  for (const f of sample_faqs) await FaqModel.create(f);
  console.log("FAQs seed is done!");
}

async function seedCheckoutAttempts() {
  const count = await CheckoutAttemptModel.countDocuments();
  if (count > 0) {
    console.log("Checkout attempts seed is already done!");
    return;
  }

  const orders = await OrderModel.find().sort({ createdAt: 1 });
  if (orders.length === 0) {
    console.log("Skipping checkout attempts seed (no orders).");
    return;
  }

  const DAY_MS = 24 * 60 * 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const attempts = [];

  // 1) Each order gets a matching attempt ~5–25 min before submission.
  for (const o of orders) {
    const offsetMs = (5 + Math.floor((o.totalPrice ?? 0) % 20)) * 60 * 1000;
    const startedAt = new Date(new Date(o.createdAt).getTime() - offsetMs);
    attempts.push({
      user: o.user ?? null,
      cartTotal: o.totalPrice,
      itemCount: (o.items ?? []).reduce((s, it) => s + (it.quantity ?? 0), 0),
      createdAt: startedAt,
      updatedAt: startedAt,
    });
  }

  // 2) Add ~15 abandoned attempts spread across the 28-day window so conversion ~62%.
  const abandonedFixtures = [
    { ago: 27, total: 8500, items: 1 },
    { ago: 25, total: 14200, items: 2 },
    { ago: 22, total: 6700, items: 1 },
    { ago: 20, total: 21500, items: 3 },
    { ago: 18, total: 9300, items: 1 },
    { ago: 16, total: 17800, items: 2 },
    { ago: 13, total: 5400, items: 1 },
    { ago: 11, total: 28900, items: 4 },
    { ago: 9, total: 11200, items: 2 },
    { ago: 7, total: 7600, items: 1 },
    { ago: 5, total: 19400, items: 3 },
    { ago: 4, total: 10100, items: 2 },
    { ago: 2, total: 24300, items: 3 },
    { ago: 1, total: 8900, items: 1 },
    { ago: 0, total: 13500, items: 2 },
  ];
  for (const f of abandonedFixtures) {
    const createdAt = new Date(Date.now() - f.ago * DAY_MS - 3 * HOUR_MS);
    attempts.push({
      user: null,
      cartTotal: f.total,
      itemCount: f.items,
      createdAt,
      updatedAt: createdAt,
    });
  }

  await CheckoutAttemptModel.insertMany(attempts, { timestamps: false });
  console.log(`Checkout attempts seed is done! (${attempts.length} attempts)`);
}
