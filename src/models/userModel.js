// import mongoose from "mongoose";
import mongoose, { Schema , model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const addressSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, required: true },
  streetAddress:{ type: String, required: true },
});

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true},
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  orderHistory: [
    {
      orderId: { type: Schema.Types.ObjectId, ref: "Order" },
      date: { type: Date, default: Date.now() },
      status: {
        type: String,
        enum: ["pending", "shipping", "delivered", "cancelled"],
        default: "pending",
      },
      totalAmount: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

// Mongoose middlewareto hash the pasworrd

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//  Method to generate reset Token

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};
 
// export const User = models?.User || model('User', userSchema)
export  const User = mongoose.model("User", userSchema)