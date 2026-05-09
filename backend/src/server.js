import { dbconnect } from "./config/database.config.js";
import express from "express";
import cors from "cors";
import foodRouter from "./routers/food.router.js";
import userRouter from "./routers/user.router.js";
import orderRouter from "./routers/order.router.js";
import adminRouter from "./routers/admin.router.js";
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

app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);

app.listen(SERVER_PORT, () => {
  console.log("Listening on port " + SERVER_PORT);
});
