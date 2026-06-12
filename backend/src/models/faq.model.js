import { model, Schema } from "mongoose";

const FaqSchema = new Schema(
  {
    question: { type: String, required: true, unique: true, trim: true, maxlength: 200 },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
    order: { type: Number, default: 0 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

export const FaqModel = model("faq", FaqSchema);
