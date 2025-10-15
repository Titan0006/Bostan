import { Router } from "express";
import authControllers from "../controllers/authControllers.js";
import verifyToken from "../utils/verifyToken.js";
import verifyUser from "../utils/verifyUser.js";
const router = Router();

router.post("/user/signup",authControllers.userSignup);
router.post("/user/verify-otp",authControllers.verifyEmailOTPForUser);
router.post("/admin/verify-otp",authControllers.verifyEmailOTPForAdmin);
router.post("/user/login",authControllers.userLogin);

//we will use this api for both user and admin
router.post("/send-otp-on-mail",authControllers.sendOTPonMail);
router.post("/verify-mail-otp",authControllers.verifyForgotPasswordOtp);
router.post("/user/send-phone-otp",verifyToken,verifyUser,authControllers.sendPhoneOtp);
router.post("/user/verify-phone-otp",verifyToken,verifyUser,authControllers.verifyPhoneOtp);
router.post("/admin/login",authControllers.adminLogin);

export default router;