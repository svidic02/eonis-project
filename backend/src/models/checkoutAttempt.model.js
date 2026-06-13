import { model, Schema } from "mongoose";

const checkoutAttemptSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, default: null },
    cartTotal: { type: Number, required: true },
    itemCount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const CheckoutAttemptModel = model("checkoutAttempt", checkoutAttemptSchema);
