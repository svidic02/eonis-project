import { Router } from "express";
import handler from "express-async-handler";
import auth from "../middleware/auth.mid.js";
import { BAD_REQUEST } from "../constants/httpStatus.js";
import { OrderModel } from "../models/order.model.js";
import { OrderStatus } from "../constants/orderStatus.js";

const router = Router();

// router.get(
//   "/",
//   handler(async (req, res) => {
//     const orders = await OrderModel.find();
//     res.send(orders);
//   })
// );

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

    // res.send(
    //   "ROUTER : JSON stringify-ed data that is save in order, which is acquired with req.body: " +
    //     JSON.stringify(order.name)
    // );

    if (items.length <= 0) res.status(BAD_REQUEST).send("Cart Is Empty!");

    //res.send("ROUTER : User : " + JSON.stringify(req.user));

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    // if ((req.user.id = undefined))
    //   res.status(BAD_REQUEST).send("User Undefined!");

    const newOrder = new OrderModel({ ...order, user: req.user.id });
    await newOrder.save();
    res.send(newOrder);
  })
);

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
