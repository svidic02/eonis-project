import { dbconnect } from "./config/database.config.js";
import express from "express";
import cors from "cors";
import productRouter from "./routers/product.router.js";
import tagRouter from "./routers/tag.router.js";
import colorRouter from "./routers/color.router.js";
import brandRouter from "./routers/brand.router.js";
import promoRouter from "./routers/promo.router.js";
import userRouter from "./routers/user.router.js";
import orderRouter from "./routers/order.router.js";
import adminRouter from "./routers/admin.router.js";
import faqRouter from "./routers/faq.router.js";
import checkoutAttemptRouter from "./routers/checkoutAttempt.router.js";
import { CLIENT_PORT, SERVER_PORT } from "./constants/ports.js";

dbconnect();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:" + CLIENT_PORT,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/api/products", productRouter);
app.use("/api/tags", tagRouter);
app.use("/api/colors", colorRouter);
app.use("/api/brands", brandRouter);
app.use("/api/promos", promoRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/faqs", faqRouter);
app.use("/api/checkout-attempts", checkoutAttemptRouter);
app.use("/api/admin", adminRouter);

// Global error handler — return 400 with a useful message for Mongoose validation errors.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.name === "ValidationError") {
    const msg = Object.values(err.errors).map((e) => e.message).join("; ");
    return res.status(400).send(msg);
  }
  console.error(err);
  res.status(500).send(err?.message || "Server error");
});

app.listen(SERVER_PORT, () => {
  console.log("Listening on port " + SERVER_PORT);
});
