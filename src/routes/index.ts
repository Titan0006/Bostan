import { Router } from "express";
import authRoutes from "./authRoutes.js"
import userRouter from "./userRoutes.js"
import adminRouter from "./adminRoutes.js"

const router = Router();

router.use("/auth",authRoutes);
router.use("/user",userRouter);
router.use("/admin",adminRouter);

export default router; 