// controllers/otpController.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Otp } from "../models/otpSchema.js";
import { Users } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";


export const sendRegistrationOtp = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler("Email is required!", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await Users.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exists!", 400));
  }

  // Basic resend cooldown: 1 request per 60 seconds per email
  const recentOtp = await Otp.findOne({ email: normalizedEmail }).sort({
    createdAt: -1,
  });
  if (recentOtp && Date.now() - recentOtp.createdAt.getTime() < 60 * 1000) {
    return next(
      new ErrorHandler("Please wait before requesting another OTP!", 429)
    );
  }

  // crypto.randomInt is cryptographically stronger than Math.random for OTPs
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.deleteMany({ email: normalizedEmail }); // clear any stale OTPs
  await Otp.create({ email: normalizedEmail, otp: hashedOtp, purpose: "register" });


  await sendEmail({
    to: normalizedEmail,
    subject: "ZeeCare Email Verification Code",
    text: `Your verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to your email!",
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return next(new ErrorHandler("Email and role are required!", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await Users.findOne({ email: normalizedEmail, role });
  if (!user) {
    // Deliberately vague message — don't reveal whether an email is registered
    return next(
      new ErrorHandler(
        "If an account with this email exists, an OTP has been sent.",
        200
      )
    );
  }

  const recentOtp = await Otp.findOne({
    email: normalizedEmail,
    purpose: "reset-password",
  }).sort({ createdAt: -1 });

  if (recentOtp && Date.now() - recentOtp.createdAt.getTime() < 60 * 1000) {
    return next(
      new ErrorHandler("Please wait before requesting another OTP!", 429)
    );
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.deleteMany({ email: normalizedEmail, purpose: "reset-password" });
  await Otp.create({
    email: normalizedEmail,
    otp: hashedOtp,
    purpose: "reset-password",
  });

  await sendEmail({
    to: normalizedEmail,
    subject: "ZeeCare Password Reset Code",
    text: `Your password reset code is ${otp}. It expires in 5 minutes. If you did not request this, please ignore this email.`,
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to your email!",
  });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, role, otp, newPassword, confirmNewPassword } = req.body;

  if (!email || !role || !otp || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please fill all fields!", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New Password and Confirm Password do not match!", 400)
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
    purpose: "reset-password",
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return next(
      new ErrorHandler(
        "OTP expired or not requested. Please request a new OTP.",
        400
      )
    );
  }

  const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOtpValid) {
    return next(new ErrorHandler("Invalid OTP!", 400));
  }

  await Otp.deleteMany({ email: normalizedEmail, purpose: "reset-password" });

  const user = await Users.findOne({ email: normalizedEmail, role }).select(
    "+password"
  );
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  user.password = newPassword; // assumes your Users schema hashes on save (pre-save hook)
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful! Please login with your new password.",
  });
});