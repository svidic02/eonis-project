import { model, Schema } from "mongoose";

const TagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    description: { type: String, default: "", maxlength: 500 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

export const TagModel = model("tag", TagSchema);
