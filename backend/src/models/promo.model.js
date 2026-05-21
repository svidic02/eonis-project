import { model, Schema } from "mongoose";

const PromoSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 30,
    },
    type: { type: String, enum: ["PERCENT", "FIXED"], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

PromoSchema.path("value").validate(function (v) {
  if (this.type === "PERCENT") return v > 0 && v <= 100;
  return v > 0;
}, "Value must be 1-100 for PERCENT promos and > 0 for FIXED promos");

export const PromoModel = model("promo", PromoSchema);
