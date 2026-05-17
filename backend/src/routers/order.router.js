import { Router } from "express";
import handler from "express-async-handler";
import auth from "../middleware/auth.mid.js";
import { BAD_REQUEST } from "../constants/httpStatus.js";
import { OrderModel } from "../models/order.model.js";
import { ProductModel } from "../models/product.model.js";
import { OrderStatus } from "../constants/orderStatus.js";

const router = Router();

router.get(
  "/newOrderForCurrentUser",
  auth,
  handler(async (req, res) => {
    const order = await getNewOrderForCurrentUser(req);
    if (order) res.send(order);
    else {
      res.send("This is order" + JSON.stringify(order));
      res.status(BAD_REQUEST).send();
    }
  })
);

router.post(
  "/create",
  auth,
  handler(async (req, res) => {
    const order = req.body;
    const items = order.items;

    if (!items || items.length <= 0) {
      return res.status(BAD_REQUEST).send("Cart Is Empty!");
    }

    // Atomically decrement stock for each ordered variant. Track applied
    // decrements so we can compensate if a later one fails (no replica-set
    // transactions assumed).
    const applied = [];
    for (const item of items) {
      const productId = item.product?._id ?? item.product?.id;
      const { sku, quantity } = item;
      if (!productId || !sku || !quantity) {
        await rollback(applied);
        return res
          .status(BAD_REQUEST)
          .send("Each item needs product, sku, and quantity");
      }
      const updated = await ProductModel.findOneAndUpdate(
        {
          _id: productId,
          variants: {
            $elemMatch: { sku, stock: { $gte: quantity } },
          },
        },
        { $inc: { "variants.$.stock": -quantity } },
        { new: true }
      );
      if (!updated) {
        await rollback(applied);
        return res.status(409).send(`Insufficient stock for ${sku}`);
      }
      applied.push({ productId, sku, quantity });
    }

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    try {
      const newOrder = new OrderModel({ ...order, user: req.user.id });
      await newOrder.save();
      res.send(newOrder);
    } catch (err) {
      await rollback(applied);
      throw err;
    }
  })
);

async function rollback(applied) {
  for (const { productId, sku, quantity } of applied) {
    await ProductModel.updateOne(
      { _id: productId, "variants.sku": sku },
      { $inc: { "variants.$.stock": quantity } }
    );
  }
}

router.put(
  "/pay",
  auth,
  handler(async (req, res) => {
    const { paymentId } = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
      res.status(BAD_REQUEST).send("Order Not Found!");
      return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    res.send(order._id);
  })
);

const getNewOrderForCurrentUser = async (req) =>
  await OrderModel.findOne({ user: req.user.id, status: OrderStatus.NEW });

export default router;
