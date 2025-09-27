import Router from "express";
import verifyToken from "../utils/verifyToken.js";
import verifyAdmin from "../utils/verifyAdmin.js";
import adminControllers from "../controllers/adminControllers.js";
const router = Router();

router.post("/me", verifyToken, verifyAdmin, adminControllers.getMyDetails);
// router.put("/update-me", verifyToken, verifyAdmin, adminControllers.updateMyDetails);
router.put("/change-password", verifyToken, verifyAdmin, adminControllers.changePassword);
router.put("/update-user-info/:id", verifyToken, verifyAdmin, adminControllers.udpateUserInfoById);
router.put("/get-user-info/:id", verifyToken, verifyAdmin, adminControllers.getUserInfoById);
router.put("/get-all-users", verifyToken, verifyAdmin, adminControllers.getAllUsers);

export default router;