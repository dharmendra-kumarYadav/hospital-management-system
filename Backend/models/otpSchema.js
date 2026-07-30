// models/otpSchema.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  purpose: {
    type: String,
    enum: ["register", "reset-password"],
    default: "register",
  },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const Otp = mongoose.model("Otp", otpSchema);