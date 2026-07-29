import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Users } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

// Patient Registration
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body);
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
  } = req.body;

  if (
    !firstName ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword ||
    !gender ||
    !dob ||
    !adhar ||
    !role
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    );
  }

  // --- DOB validation: cannot be a future date ---
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

  // --- Email uniqueness check ---
  let user = await Users.findOne({ email: email.trim().toLowerCase() });
  if (user) {
    return next(new ErrorHandler("User Already Registered!", 400));
  }

  // --- Adhar uniqueness check ---
  const isAdharRegistered = await Users.findOne({ adhar: adhar.trim() });
  if (isAdharRegistered) {
    return next(
      new ErrorHandler("User With This Adhar Number Already Exists!", 400)
    );
  }

  user = await Users.create({
    firstName,
    lastName: lastName || "",
    email: email.trim().toLowerCase(),
    phone,
    password,
    gender,
    dob,
    adhar: adhar.trim(),
    role,
  });

  generateToken(user, "User Registered!", 200, res);
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

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, adhar, confirmPassword } =
    req.body;

  if (
    !firstName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !adhar ||
    !confirmPassword
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    );
  }

  // --- DOB validation: cannot be a future date ---
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

  // --- Email uniqueness check ---
  const isEmailRegistered = await Users.findOne({
    email: email.trim().toLowerCase(),
  });
  if (isEmailRegistered) {
    return next(
      new ErrorHandler(
        `${isEmailRegistered.role} with this email Already Exist!`,
        400
      )
    );
  }

  // --- Adhar uniqueness check ---
  const isAdharRegistered = await Users.findOne({ adhar: adhar.trim() });
  if (isAdharRegistered) {
    return next(
      new ErrorHandler(
        `${isAdharRegistered.role} with this Adhar Number Already Exist!`,
        400
      )
    );
  }

  const admin = await Users.create({
    firstName,
    lastName: lastName || "",
    email: email.trim().toLowerCase(),
    phone,
    password,
    gender,
    dob,
    adhar: adhar.trim(),
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
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
  } = req.body;

  console.log("Incoming doctor registration payload:", {
    email,
    adhar,
    dob,
  });

  if (
    !firstName ||
    !email ||
    !phone ||
    !adhar ||
    !dob ||
    !gender ||
    !password ||
    !confirmPassword ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    );
  }

  // --- DOB validation ---
  // Expecting an ISO-style date string like "YYYY-MM-DD" from an <input type="date">
  const dobDate = new Date(dob);
  console.log("Parsed dobDate:", dobDate, "Now:", new Date());

  if (isNaN(dobDate.getTime())) {
    return next(new ErrorHandler("Invalid Date of Birth!", 400));
  }

  // Zero-out time on "now" so today's date itself is still allowed
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (dobDate.getTime() > today.getTime()) {
    return next(
      new ErrorHandler("Date of Birth cannot be a future date!", 400)
    );
  }

  // --- Email uniqueness check ---
  const isEmailRegistered = await Users.findOne({
    email: email.trim().toLowerCase(),
  });
  console.log("isEmailRegistered:", isEmailRegistered);
  if (isEmailRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }

  // --- Adhar uniqueness check ---
  const isAdharRegistered = await Users.findOne({ adhar: adhar.trim() });
  console.log("isAdharRegistered:", isAdharRegistered);
  if (isAdharRegistered) {
    return next(
      new ErrorHandler("Doctor With This Adhar Number Already Exists!", 400)
    );
  }

  // --- Doctor avatar (optional) ---
  let docAvatarData;
  if (req.files && req.files.docAvatar) {
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
      return next(new ErrorHandler("File Format Not Supported!", 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      docAvatar.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return next(
        new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
      );
    }
    docAvatarData = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  const doctorPayload = {
    firstName,
    lastName: lastName || "",
    email: email.trim().toLowerCase(),
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
  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});
