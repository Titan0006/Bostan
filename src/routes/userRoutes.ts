import Router from "express";
import verifyToken from "../utils/verifyToken.js";
import verifyUser from "../utils/verifyUser.js";
import userControllers from "../controllers/userControllers.js";
const router = Router();

router.post("/me",verifyToken,verifyUser,userControllers.getMyDetails);
router.put("/update-me",verifyToken,verifyUser,userControllers.updateMyDetails);
router.put("/change-password",verifyToken,verifyUser,userControllers.changePassword);

export default router;