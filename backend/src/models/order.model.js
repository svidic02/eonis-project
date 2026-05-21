import { model, Schema } from "mongoose";
import { OrderStatus } from "../constants/orderStatus.js";
import { ProductModel } from "./product.model.js";

export const OrderItemSchema = new Schema(
  {
    product: { type: ProductModel.schema, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedColor: { type: String, required: true },
    selectedSize: { type: Number, required: true },
    sku: { type: String, required: true },
  },
  {
    _id: false,
  }
);

OrderItemSchema.pre("validate", function (next) {
  this.price = this.product.price * this.quantity;
  next();
});

const orderSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, default: "" },
    paymentId: { type: String },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    promoCode: { type: String, default: null },
    totalPrice: { type: Number, required: true },
    items: { type: [OrderItemSchema], required: true },
    status: { type: String, default: OrderStatus.NEW },
    paymentMethod: { type: String, enum: ["COD", "PAYPAL"], default: "COD" },
    user: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const OrderModel = model("order", orderSchema);
