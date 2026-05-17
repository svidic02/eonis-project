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
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String, enum: ["men", "women", "kids"] },
    description: { type: String },
    price: { type: Number, required: true },
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
