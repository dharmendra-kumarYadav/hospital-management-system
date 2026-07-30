import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  patientRegister,
} from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";
import { googleLogin } from "../controller/userController.js";
import { sendRegistrationOtp, forgotPassword, resetPassword } from "../controller/otpController.js";


const router = express.Router();

router.post("/otp/send", sendRegistrationOtp);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);
router.post("/patient/register", patientRegister);
router.post("/login", login);
router.post("/admin/addNew", isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.post("/doctor/addNew", isAdminAuthenticated, addNewDoctor);
router.post("/google-login", googleLogin);

export default router;