import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appoinmentSchema.js";
import { Users } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import { Otp } from "../models/otpSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    adhar,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
    otp,
  } = req.body;

  // ==========================
  // Required Fields
  // ==========================

  if (
    !firstName ||
    !email ||
    !phone ||
    !adhar ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_firstName ||
    !address ||
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
  // DOB Validation
  // ==========================

  const dobDate = new Date(dob);

  if (isNaN(dobDate.getTime())) {
    return next(new ErrorHandler("Invalid Date of Birth!", 400));
  }

  // ==========================
  // Appointment Date Validation
  // ==========================

  const appointmentDate = new Date(appointment_date);

  if (isNaN(appointmentDate.getTime())) {
    return next(new ErrorHandler("Invalid Appointment Date!", 400));
  }

  // ==========================
  // Doctor Validation
  // ==========================

  const matchingDoctors = await Users.find({
    firstName: doctor_firstName,
    role: "Doctor",
    doctorDepartment: department,
  });

  const isConflict = matchingDoctors.filter(
    (doctor) =>
      (doctor.lastName || "") === (doctor_lastName || "")
  );

  if (isConflict.length === 0) {
    return next(new ErrorHandler("Doctor not found!", 400));
  }

  if (isConflict.length > 1) {
    return next(
      new ErrorHandler(
        "Doctor Conflict. Please Contact Through Email or Phone!",
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
  // Create Appointment
  // ==========================

  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;

  const appointment = await Appointment.create({
    firstName,
    lastName: lastName || "",
    email: normalizedEmail,
    phone,
    adhar: adhar.trim(),
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName || "",
    },
    hasVisited,
    address,
    doctorId,
    patientId,
  });

  // Consume OTP only after successful appointment booking
  await Otp.deleteMany({
    email: normalizedEmail,
  });

  res.status(200).json({
    success: true,
    message: "Appointment booked successfully!",
    appointment,
  });
});

export const getAllAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.find();
  res.status(200).json({
    success: true,
    appointment,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new ErrorHandler("Appointment not Found!", 400));
    }
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      message: "Appointment Status Updated!",
      appointment,
    });
  }
);

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 400));
  }
  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});
