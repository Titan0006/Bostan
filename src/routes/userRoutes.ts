import Router from "express";
import verifyToken from "../utils/verifyToken.js";
import verifyUser from "../utils/verifyUser.js";
import userControllers from "../controllers/userControllers.js";
import {upload} from '../config/multerConfig.js'
const router = Router();

router.post("/me",verifyToken,verifyUser,userControllers.getMyDetails);
router.put("/update-me",verifyToken,verifyUser,userControllers.updateMyDetails);
router.put("/change-password",verifyToken,verifyUser,userControllers.changePassword);
router.post("/upload-file",upload.any(),userControllers.uploadFile);

export default router;