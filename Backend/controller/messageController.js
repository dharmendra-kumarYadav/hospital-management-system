import {catchAsyncErrors} from '../middlewares/catchAsyncErrors.js'
import { Message } from '../models/messageSchema.js'
import ErrorHandler from '../middlewares/errorMiddleware.js'
import bcrypt from "bcrypt";
import { Otp } from "../models/otpSchema.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    message,
    otp,
  } = req.body;

  // ==========================
  // Required Fields
  // ==========================

  if (
    !firstName ||
    !email ||
    !phone ||
    !message ||
    !otp
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ==========================
  // Phone Validation
  // ==========================

  if (phone.trim().length !== 10) {
    return next(
      new ErrorHandler(
        "Mobile Number must contain exactly 10 digits!",
        400
      )
    );
  }

  // ==========================
  // OTP Verification
  // ==========================

  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
  }).sort({
    createdAt: -1,
  });

  if (!otpRecord) {
    return next(
      new ErrorHandler(
        "OTP expired or not requested. Please request a new OTP.",
        400
      )
    );
  }

  const isOtpValid = await bcrypt.compare(
    otp,
    otpRecord.otp
  );

  if (!isOtpValid) {
    return next(new ErrorHandler("Invalid OTP!", 400));
  }

  // ==========================
  // Save Message
  // ==========================

  await Message.create({
    firstName,
    lastName: lastName || "",
    email: normalizedEmail,
    phone,
    message,
  });

  // Consume OTP only after successful submission
  await Otp.deleteMany({
    email: normalizedEmail,
  });

  res.status(200).json({
    success: true,
    message: "Message Sent Successfully!",
  });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
    const message = await Message.find();
    res.status(200).json({
        success: true,
        message,
    });
});