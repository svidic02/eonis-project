import { model, Schema } from "mongoose";

export const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 200 },
    password: { type: String, required: true, maxlength: 200 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);

export const UserModel = model("user", UserSchema);
