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
  if(password !== confirmPassword) {
    return next(new ErrorHandler("Password and Confirm Password do not match!", 400));
  }

  let user = await Users.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User Already Registered!", 400));
  }

  user = await Users.create({
    firstName,
    lastName: lastName || "",
    email,
    phone,
    password,
    gender,
    dob,
    adhar,
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

  const isRegistered = await Users.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} with this email Already Exist!`,
        400
      )
    );
  }
  const admin = await Users.create({
    firstName,
    lastName: lastName || "",
    email,
    phone,
    password,
    gender,
    dob,
    adhar,
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
  const isRegistered = await Users.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }

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
    email,
    phone,
    adhar,
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
