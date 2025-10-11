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
router.post("/add-story", verifyToken, verifyAdmin, adminControllers.createStoryWithScenes);
router.post("/add-story/:id", verifyToken, verifyAdmin, adminControllers.createStoryWithScenes);
router.post("/add-story", verifyToken, verifyAdmin, adminControllers.createStoryWithScenes);
router.post("/add-story-scene", verifyToken, verifyAdmin, adminControllers.createStoryScenes);
router.post("/add-story-scene/:id", verifyToken, verifyAdmin, adminControllers.createStoryScenes);
router.get("/get-all-manner-tags", adminControllers.getAllMannerTags);
router.get("/get-all-stories", verifyToken, verifyAdmin, adminControllers.getAllStories);
router.get("/get-story/:id", verifyToken, verifyAdmin, adminControllers.getStoryById);
router.get("/get-story-scene/:id", verifyToken, verifyAdmin, adminControllers.getStorySceneById);
router.get("/get-story-scene/:id", verifyToken, verifyAdmin, adminControllers.getStorySceneById);
router.post("/delete-story/:id", verifyToken, verifyAdmin, adminControllers.deleteStoryById);
router.post("/delete-story-scene/:id", verifyToken, verifyAdmin, adminControllers.deleteStorySceneById);
router.get("/get-all-story-scenes/:id", verifyToken, verifyAdmin, adminControllers.getAllStoryScenes);

export default router;