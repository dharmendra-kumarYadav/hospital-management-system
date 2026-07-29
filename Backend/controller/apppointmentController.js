import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appoinmentSchema.js";
import { Users } from "../models/userSchema.js";

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
  } = req.body;

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
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // --- Gender validation (accepts Male, Female, Other) ---
  const allowedGenders = ["Male", "Female", "Other"];
  if (!allowedGenders.includes(gender)) {
    return next(new ErrorHandler("Invalid Gender Selected!", 400));
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

  // --- Appointment date validation: cannot be a past date ---
  const appointmentDateObj = new Date(appointment_date);
  if (isNaN(appointmentDateObj.getTime())) {
    return next(new ErrorHandler("Invalid Appointment Date!", 400));
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (appointmentDateObj.getTime() < startOfToday.getTime()) {
    return next(
      new ErrorHandler("Appointment Date cannot be a past date!", 400)
    );
  }

  const matchingDoctors = await Users.find({
    firstName: doctor_firstName,
    role: "Doctor",
    doctorDepartment: department,
  });

  const isConflict = matchingDoctors.filter(
    (doctor) => (doctor.lastName || "") === (doctor_lastName || "")
  );

  if (isConflict.length === 0) {
    return next(new ErrorHandler("Doctor not found!", 400));
  }

  if (isConflict.length > 1) {
    return next(
      new ErrorHandler(
        "Doctor Conflict Please Contact Through Email or Phone!",
        400
      )
    );
  }

  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;
  const appointment = await Appointment.create({
    firstName,
    lastName: lastName || "",
    email,
    phone,
    adhar,
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

  res.status(200).json({
    success: true,
    Message: "Appointment send successfully!",
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