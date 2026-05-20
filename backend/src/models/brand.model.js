import { model, Schema } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    logoUrl: { type: String, default: "", maxlength: 500 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

export const BrandModel = model("brand", BrandSchema);
