import { model, Schema } from "mongoose";

const ColorSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    hex: {
      type: String,
      required: true,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

export const ColorModel = model("color", ColorSchema);
