import express from "express";
import { getAllMessages, sendMessahe } from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send", sendMessahe);
router.get("/getall",isAdminAuthenticated, getAllMessages);

export default router;