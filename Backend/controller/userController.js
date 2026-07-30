import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Users } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";
import { Otp } from "../models/otpSchema.js";
import { OAuth2Client } from "google-auth-library";

// Patient Registration
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    gender,
    dob,
    adhar,
    role,
    otp,
  } = req.body;

  // Required fields
  if (
    !firstName ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword ||
    !gender ||
    !dob ||
    !adhar ||
    !role ||
    !otp
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Password validation
  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // DOB validation
  const dobDate = new Date(dob);

  if (isNaN(dobDate.getTime())) {
    return next(new ErrorHandler("Invalid Date of Birth!", 400));
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (dobDate.getTime() > today.getTime()) {
    return next(
      new ErrorHandler("Date of Birth cannot be a future date!", 400)
    );
  }

  // Check existing email
  const user = await Users.findOne({ email: normalizedEmail });

  if (user) {
    return next(new ErrorHandler("User Already Registered!", 400));
  }

  // Check existing Aadhaar
  const isAdharRegistered = await Users.findOne({
    adhar: adhar.trim(),
  });

  if (isAdharRegistered) {
    return next(
      new ErrorHandler("User With This Aadhaar Number Already Exists!", 400)
    );
  }

  // ----------------------------
  // Verify OTP (Only after all validations pass)
  // ----------------------------
  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
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

  // Create user
  const newUser = await Users.create({
    firstName,
    lastName: lastName || "",
    email: normalizedEmail,
    phone,
    password,
    gender,
    dob,
    adhar: adhar.trim(),
    role: "Patient",
  });

  // Delete OTP after successful registration
  await Otp.deleteMany({ email: normalizedEmail });

  generateToken(newUser, "User Registered Successfully!", 200, res);
});

// User Login
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email && !password || !role) {
    return next(new ErrorHandler("Please Enter Email and Password!", 400));
  }
  else if (!email) {
    return next(new ErrorHandler("Please Enter Email!", 400));
  } else if (!password) {
    return next(new ErrorHandler("Please Enter Password!", 400));
  }

  const user = await Users.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User With This Role Not Found!", 400));
  }

  generateToken(user, "User Logged In Successfully!", 200, res);
});


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = catchAsyncErrors(async (req, res, next) => {
  const { credential, role } = req.body;

  if (!credential || !role) {
    return next(new ErrorHandler("Missing Google credential or role!", 400));
  }

  // Verify the token with Google — never trust a client-submitted token blindly
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    return next(new ErrorHandler("Invalid Google credential!", 400));
  }

  if (!payload.email_verified) {
    return next(new ErrorHandler("Google email is not verified!", 400));
  }

  const email = payload.email.trim().toLowerCase();

  const user = await Users.findOne({ email });
  if (!user) {
    return next(
      new ErrorHandler(
        "No account found with this email. Please register first.",
        404
      )
    );
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User With This Role Not Found!", 400));
  }

  generateToken(user, "User Logged In Successfully!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    gender,
    dob,
    adhar,
    otp,
  } = req.body;

  // ==========================
  // Required Fields
  // ==========================

  if (
    !firstName ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword ||
    !gender ||
    !dob ||
    !adhar ||
    !otp
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // ==========================
  // Password Validation
  // ==========================

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler(
        "Password and Confirm Password do not match!",
        400
      )
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ==========================
  // DOB Validation
  // ==========================

  const dobDate = new Date(dob);

  if (isNaN(dobDate.getTime())) {
    return next(new ErrorHandler("Invalid Date of Birth!", 400));
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (dobDate.getTime() > today.getTime()) {
    return next(
      new ErrorHandler(
        "Date of Birth cannot be a future date!",
        400
      )
    );
  }

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
  // Aadhaar Validation
  // ==========================

  if (adhar.trim().length !== 12) {
    return next(
      new ErrorHandler(
        "Aadhaar Number must contain exactly 12 digits!",
        400
      )
    );
  }

  // ==========================
  // Duplicate Email Check
  // ==========================

  const existingEmail = await Users.findOne({
    email: normalizedEmail,
  });

  if (existingEmail) {
    return next(
      new ErrorHandler(
        `${existingEmail.role} with this email already exists!`,
        400
      )
    );
  }

  // ==========================
  // Duplicate Aadhaar Check
  // ==========================

  const existingAdhar = await Users.findOne({
    adhar: adhar.trim(),
  });

  if (existingAdhar) {
    return next(
      new ErrorHandler(
        `${existingAdhar.role} with this Aadhaar Number already exists!`,
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
  // Create Admin
  // ==========================

  await Users.create({
    firstName,
    lastName: lastName || "",
    email: normalizedEmail,
    phone,
    password,
    gender,
    dob,
    adhar: adhar.trim(),
    role: "Admin",
  });

  // Consume OTP only after successful registration
  await Otp.deleteMany({
    email: normalizedEmail,
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered Successfully!",
  });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await Users.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out successfully!",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient Logged Out successfully!",
    });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    adhar,
    dob,
    gender,
    password,
    confirmPassword,
    doctorDepartment,
    otp,
  } = req.body;

  if (
    !firstName ||
    !email ||
    !phone ||
    !adhar ||
    !dob ||
    !gender ||
    !password ||
    !confirmPassword ||
    !doctorDepartment ||
    !otp
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ==========================
  // Validate DOB
  // ==========================

  const dobDate = new Date(dob);

  if (isNaN(dobDate.getTime())) {
    return next(new ErrorHandler("Invalid Date of Birth!", 400));
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (dobDate.getTime() > today.getTime()) {
    return next(
      new ErrorHandler("Date of Birth cannot be a future date!", 400)
    );
  }

  // ==========================
  // Phone Validation
  // ==========================

  if (phone.trim().length !== 10) {
    return next(
      new ErrorHandler("Mobile Number must contain exactly 10 digits!", 400)
    );
  }

  // ==========================
  // Aadhaar Validation
  // ==========================

  if (adhar.trim().length !== 12) {
    return next(
      new ErrorHandler("Aadhaar Number must contain exactly 12 digits!", 400)
    );
  }

  // ==========================
  // Existing User Check
  // ==========================

  const existingEmail = await Users.findOne({ email: normalizedEmail });

  if (existingEmail) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }

  const existingAdhar = await Users.findOne({
    adhar: adhar.trim(),
  });

  if (existingAdhar) {
    return next(
      new ErrorHandler(
        "Doctor With This Aadhaar Number Already Exists!",
        400
      )
    );
  }

  // ==========================
  // Avatar Validation
  // ==========================

  let docAvatarData;

  if (req.files && req.files.docAvatar) {
    const { docAvatar } = req.files;

    const allowedFormats = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedFormats.includes(docAvatar.mimetype)) {
      return next(
        new ErrorHandler("File Format Not Supported!", 400)
      );
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
      docAvatar.tempFilePath
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary Error"
      );

      return next(
        new ErrorHandler(
          "Failed To Upload Doctor Avatar To Cloudinary",
          500
        )
      );
    }

    docAvatarData = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
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
  // Create Doctor
  // ==========================

  const doctorPayload = {
    firstName,
    lastName: lastName || "",
    email: normalizedEmail,
    phone,
    adhar: adhar.trim(),
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
  };

  if (docAvatarData) {
    doctorPayload.docAvatar = docAvatarData;
  }

  const doctor = await Users.create(doctorPayload);

  // Consume OTP only after successful registration
  await Otp.deleteMany({
    email: normalizedEmail,
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered Successfully!",
    doctor,
  });
});
