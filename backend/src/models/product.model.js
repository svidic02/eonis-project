import { model, Schema } from "mongoose";

const VariantSchema = new Schema(
  {
    color: { type: String, required: true },
    size: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String },
  },
  { _id: false }
);

export const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    brand: { type: String, required: true, trim: true, maxlength: 80 },
    gender: { type: String, enum: ["men", "women", "kids"], required: true },
    category: {
      type: String,
      enum: ["Sneakers", "Boots", "Running", "Formal", "Sandals"],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    tags: { type: [String] },
    images: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

ProductSchema.virtual("imageUrl").get(function () {
  return this.images?.[0];
});

ProductSchema.pre("save", function (next) {
  if (this.variants?.length) {
    for (const v of this.variants) {
      if (!v.sku) v.sku = `${this._id}-${v.color}-${v.size}`;
    }
  }
  next();
});

export const ProductModel = model("product", ProductSchema);
