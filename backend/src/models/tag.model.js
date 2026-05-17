import { model, Schema } from "mongoose";

const TagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

export const TagModel = model("tag", TagSchema);
