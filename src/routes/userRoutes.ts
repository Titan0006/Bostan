import Router from "express";
import verifyToken from "../utils/verifyToken.js";
import verifyUser from "../utils/verifyUser.js";
import userControllers from "../controllers/userControllers.js";
import {upload} from '../config/multerConfig.js'
const router = Router();

router.post("/me",verifyToken,verifyUser,userControllers.getMyDetails);
router.put("/update-me",verifyToken,verifyUser,userControllers.updateMyDetails);
router.put("/change-password",verifyToken,verifyUser,userControllers.changePassword);
router.post("/reset-password",verifyToken,verifyUser,userControllers.resetPassword);
router.post("/upload-file",upload.any(),userControllers.uploadFile);
router.get("/get-dashboard",verifyToken,verifyUser,userControllers.getDashboard);
router.get("/get-library",verifyToken,verifyUser,userControllers.getLibrary);
router.get("/random-stories",verifyToken,verifyUser,userControllers.getRandomStories);
router.get("/get-story/:id",verifyToken,verifyUser,userControllers.viewStory); // to view story
router.get("/get-all-reviews",verifyToken,verifyUser,userControllers.getAllMyReviews); // to view story
router.post("/review-story",verifyToken,verifyUser,userControllers.createReviewOfStory); // to view story
// router.post("/review-story/:id",verifyToken,verifyUser,userControllers.createReviewOfStory); // to view story
router.get("/search-page",verifyToken,verifyUser,userControllers.getAllStoriesAccordingToFilter); // to view story

export default router;