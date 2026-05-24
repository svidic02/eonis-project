import { Router } from "express";
import handler from "express-async-handler";
import auth, { optionalAuth } from "../middleware/auth.mid.js";
import { signOrderToken, verifyOrderToken } from "../utils/orderToken.js";
import { BAD_REQUEST } from "../constants/httpStatus.js";
import { OrderModel } from "../models/order.model.js";
import { ProductModel } from "../models/product.model.js";
import { PromoModel } from "../models/promo.model.js";
import { OrderStatus } from "../constants/orderStatus.js";
import { SHIPPING_FEE, FREE_SHIPPING_OVER } from "../constants/shipping.js";

const router = Router();

router.get(
  "/mine",
  auth,
  handler(async (req, res) => {
    const orders = await OrderModel.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.send(orders);
  })
);

router.get(
  "/:id",
  optionalAuth,
  handler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).send("Order not found");

    const isOwner = req.user && order.user && String(order.user) === req.user.id;
    const isAdmin = req.user?.isAdmin;
    const tokenOrderId = verifyOrderToken(req.query.t);
    const tokenMatches = tokenOrderId && tokenOrderId === String(order._id);

    if (!isOwner && !isAdmin && !tokenMatches) {
      return res.status(403).send("Forbidden");
    }
    res.send(order);
  })
);

router.post(
  "/create",
  optionalAuth,
  handler(async (req, res) => {
    const order = req.body;
    const items = order.items;

    if (!items || items.length <= 0) {
      return res.status(BAD_REQUEST).send("Cart Is Empty!");
    }

    const isGuest = !req.user;
    const guestEmail = (order.email || "").trim();
    if (isGuest && !guestEmail) {
      return res.status(BAD_REQUEST).send("Email is required for guest checkout");
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

    if (req.user) {
      await OrderModel.deleteOne({
        user: req.user.id,
        status: OrderStatus.NEW,
      });
    }

    try {
      const paymentMethod = ["COD", "PAYPAL"].includes(order.paymentMethod)
        ? order.paymentMethod
        : "COD";
      // Recompute the breakdown server-side. OrderItemSchema's pre('validate')
      // sets each item's price = product.price * quantity, so subtotal can be
      // derived after construction.
      const draft = new OrderModel({
        ...order,
        user: req.user?.id,
        guestEmail: isGuest ? guestEmail : "",
        paymentMethod,
        status: paymentMethod === "COD" ? OrderStatus.COD_PENDING : OrderStatus.NEW,
        subtotal: 0,
        shipping: 0,
        discount: 0,
        promoCode: null,
        totalPrice: 0,
      });
      await draft.validate();

      const subtotal = draft.items.reduce((s, it) => s + it.price, 0);
      const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;

      let discount = 0;
      let promoCode = null;
      const requestedCode = (order.promoCode || "").trim().toUpperCase();
      if (requestedCode) {
        const promo = await PromoModel.findOne({ code: requestedCode, active: true });
        if (!promo) {
          await rollback(applied);
          return res.status(BAD_REQUEST).send("Promo code is not valid");
        }
        if (subtotal < promo.minSubtotal) {
          await rollback(applied);
          return res.status(BAD_REQUEST).send(`Promo requires subtotal of at least ${promo.minSubtotal}`);
        }
        const raw = promo.type === "PERCENT"
          ? Math.round((subtotal * promo.value) / 100)
          : promo.value;
        discount = Math.min(raw, subtotal);
        promoCode = promo.code;
      }

      draft.subtotal = subtotal;
      draft.shipping = shipping;
      draft.discount = discount;
      draft.promoCode = promoCode;
      draft.totalPrice = Math.max(0, subtotal + shipping - discount);

      await draft.save();
      if (isGuest) {
        const token = signOrderToken(draft._id);
        return res.send({ ...draft.toObject(), token });
      }
      res.send(draft);
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
