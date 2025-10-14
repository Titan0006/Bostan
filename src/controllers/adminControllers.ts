import { Request, Response } from "express";
import {
  User,
  OTP,
  Admin,
  Story,
  StoryScenes,
  StoryOfTheWeek,
  UserActivity,
} from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import getMessage from "../i18n/index.js";
import TwilioService from "../helpers/twilioService.js";
import EmailService from "../helpers/SendMail.js";
import { generateOTP } from "../utils/generateOTP.js";
import jwt from "jsonwebtoken";
import { negativeMannerTags } from "../helpers/NegativeMannerTags.js";
import { positiveMannerTags } from "../helpers/PositiveMannerTags.js";

class adminController {
  constructor() {
    this.getMyDetails = this.getMyDetails.bind(this);
    this.updateMyDetails = this.updateMyDetails.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.udpateUserInfoById = this.udpateUserInfoById.bind(this);
    this.getUserInfoById = this.getUserInfoById.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getAllMannerTags = this.getAllMannerTags.bind(this);
    this.getAllStories = this.getAllStories.bind(this);
    this.getAllStoryScenes = this.getAllStoryScenes.bind(this);
    this.getStoryById = this.getStoryById.bind(this);
    this.deleteStoryById = this.deleteStoryById.bind(this);
    this.deleteStorySceneById = this.deleteStorySceneById.bind(this);
    this.getStorySceneById = this.getStorySceneById.bind(this);
    this.addStoryOfTheWeek = this.addStoryOfTheWeek.bind(this);
    this.getAllFeaturedStories = this.getAllFeaturedStories.bind(this);
    this.getAllBannerStories = this.getAllBannerStories.bind(this);
    this.getAllUsersCount = this.getAllUsersCount.bind(this);
  }

  async getMyDetails(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const user = (req as any).user;

      const admin_details = await Admin.findOne({ _id: user.id }).populate(
        "-password"
      );

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: admin_details,
      });
    } catch (error) {
      console.error("Error in userSignup of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async updateMyDetails(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const user = (req as any).user;
      const body = req.body;

      let user_details = await Admin.findByIdAndUpdate(user.id, body, {
        new: true,
      });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1014,
        msg: getMessage(1014, languageCode),
        data: user_details,
      });
    } catch (error) {
      console.error("Error in userSignup of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async changePassword(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const user = (req as any).user;
      const { password } = req.body;

      if (!password || password.trim() === "") {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1016,
          msg: getMessage(1016, languageCode),
          data: null,
        });
      }

      let user_details = await Admin.findById(user.id);
      if (user_details) {
        (user_details as any).password = password;
        await user_details.save();
      }
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1015,
        msg: getMessage(1015, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in userSignup of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async udpateUserInfoById(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const admin = (req as any).user;
      const body = req.body;

      const id = req.params.id;

      const userExists = await User.findById(id);

      if (!userExists) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1017,
          msg: getMessage(1017, languageCode),
          data: null,
        });
      }

      if (
        (body.isDelete && body.isDelete === true) ||
        body.isActive === false
      ) {
      }
      const updated_user = await User.findByIdAndUpdate(id, body, {
        new: true,
      });
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1014,
        msg: getMessage(1014, languageCode),
        data: updated_user,
      });
    } catch (error) {
      console.error("Error in userSignup of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getUserInfoById(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const admin = (req as any).user;

      const id = req.params.id;

      const userExists = await User.findById(id);

      if (!userExists) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1017,
          msg: getMessage(1017, languageCode),
          data: null,
        });
      }

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in userSignup of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getAllUsers(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const admin = (req as any).user;

      const users = await User.find({is_active:false,is_deleted:false}).sort({createdAt:-1});

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: users,
      });
    } catch (error) {
      console.error("Error in userSignup of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async createStoryWithScenes(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { story, scenes } = req.body;

      const id = req.params.id;

      if (!story) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1021, // 🔹 choose a msgCode for "Story data required"
          msg: getMessage(1021, languageCode),
          data: null,
        });
      }

      if (id) {
        const storyExist = await Story.findById(id);

        if (!storyExist) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1024,
            msg: getMessage(1024, languageCode),
            data: null,
          });
        }

        let savedScenes: any[] = [];
        if (scenes) {
          // then delete the old scenes
          await StoryScenes.deleteMany({ storyId: id });
          if (Array.isArray(scenes) && scenes.length > 0) {
            const scenesWithStoryId = scenes.map((scene) => ({
              ...scene,
              storyId: storyExist._id,
            }));

            savedScenes = await StoryScenes.insertMany(scenesWithStoryId);
          }
        }

        const updateStory = await Story.findByIdAndUpdate(
          id,
          { ...story },
          { new: true }
        );

        return ResponseHandler.send(res, {
          statusCode: 200,
          status: "success",
          msgCode: 1025,
          msg: getMessage(1025, languageCode),
          data: {
            story: updateStory,
          },
        });
      }
      // 1. Save story
      const newStory = await Story.create(story);

      // 2. Save scenes linked with storyId
      let savedScenes: any[] = [];
      if (Array.isArray(scenes) && scenes.length > 0) {
        const scenesWithStoryId = scenes.map((scene) => ({
          ...scene,
          storyId: newStory._id,
        }));

        savedScenes = await StoryScenes.insertMany(scenesWithStoryId);
      }

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1026, //
        msg: getMessage(1026, languageCode),
        data: {
          story: newStory,
          scenes: savedScenes,
        },
      });
    } catch (error) {
      console.error("Error in createStoryWithScenes:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async createStoryScenes(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { sceneNumber, text, image, storyId } = req.body;

      const id = req.params.id;

      const getAllScenesCount = await StoryScenes.countDocuments({ storyId });
      if (id) {
        const sceneExist = await StoryScenes.findOne({ _id: id });

        if (!sceneExist) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1028,
            msg: getMessage(1028, languageCode),
            data: null,
          });
        }

        const updateScene = await StoryScenes.findByIdAndUpdate(id, req.body, {
          new: true,
        });

        return ResponseHandler.send(res, {
          statusCode: 200,
          status: "success",
          msgCode: 1025,
          msg: getMessage(1025, languageCode),
          data: updateScene,
        });
      }

      const newSceneCreate = await StoryScenes.create({
        text,
        image,
        storyId,
        sceneNumber:
          Number(getAllScenesCount) > 0 ? Number(getAllScenesCount) + 1 : 1,
      });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1027, //
        msg: getMessage(1027, languageCode),
        data: newSceneCreate,
      });
    } catch (error) {
      console.error("Error in createStoryWithScenes:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async addStoryOfTheWeek(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { storyId } = req.body;

      await StoryOfTheWeek.deleteMany({});

      await StoryOfTheWeek.create({ storyId });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1032,
        msg: getMessage(1032, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in createStoryWithScenes:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getAllMannerTags(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let mannerTags = { positiveMannerTags, negativeMannerTags };

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013, //
        msg: getMessage(1013, languageCode),
        data: mannerTags,
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getAllFeaturedStories(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let allFeaturedStories = await Story.find({
        status: "published",
        is_featured: true,
      });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013, //
        msg: getMessage(1013, languageCode),
        data: allFeaturedStories,
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getAllBannerStories(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let allBannerStories = await Story.find({
        status: "published",
        banner_story: true,
      });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013, //
        msg: getMessage(1013, languageCode),
        data: allBannerStories,
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getAllUsersCount(req: Request, res: Response) {
    const languageCode = (req.headers["language"] as string) || "en";

    try {
      let type = (req.query.type as string) || "all"; // all, day, month, year, custom
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      // 🕒 Determine date range based on type
      const now = new Date();

      if (type === "day") {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
      } else if (type === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
      } else if (type === "year") {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else if (type === "custom") {
        const start = req.query.startDate as string;
        const end = req.query.endDate as string;

        if (!start || !end) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 400,
            msg: "Please provide both startDate and endDate for custom type.",
            data: null,
          });
        }

        startDate = new Date(start);
        endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
      }

      // 🧮 Build date filter if needed
      const dateFilter =
        type === "all" ? {} : { createdAt: { $gte: startDate, $lte: endDate } };

      // 🧾 Counts
      const [no_of_users, no_of_stories, no_of_paid_users, no_of_active_users] =
        await Promise.all([
          User.countDocuments(dateFilter),
          Story.countDocuments(dateFilter),
          User.countDocuments({
            subscription_plan: { $ne: "free_trial" },
            ...dateFilter,
          }),
          UserActivity.countDocuments(dateFilter),
        ]);

      // ✅ Send response
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: {
          type,
          range: {
            startDate,
            endDate,
          },
          counts: {
            no_of_users,
            no_of_stories,
            no_of_paid_users,
            no_of_active_users,
          },
        },
      });
    } catch (error) {
      console.error("Error in getAllUsersCount:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }

  async getAllStories(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let limit = Number(req.query.limit) || 10;
      let page = Number(req.query.page) || 1;
      let search = (req.query.search as string) || "";
      let skip = (page - 1) * limit;

      let filters: any = {};

      if (search && search.trim() != "") {
        const regex = new RegExp(search.trim(), "i");
        filters.$or = [{ title: regex }];
      }

      let stories = await Story.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      stories = await Promise.all(
        stories.map(async (story: any) => {
          const sceneCount = await StoryScenes.countDocuments({
            storyId: story._id,
          });
          return { ...story, total_scenes: sceneCount };
        })
      );
      const totalStories = await Story.countDocuments(filters);
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013, //
        msg: getMessage(1013, languageCode),
        data: {
          stories,
          pagination: {
            total: totalStories,
            page,
            limit,
            totalPages: Math.ceil(totalStories / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getAllStoryScenes(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let id = req.params.id;

      const allScenes = await StoryScenes.find({ storyId: id }).sort(
        "sceneNumber"
      );
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013, //
        msg: getMessage(1013, languageCode),
        data: allScenes,
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getStoryById(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let id = req.params.id;

      const story = await Story.findById(id);

      if (!story) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1024,
          msg: getMessage(1024, languageCode),
          data: null,
        });
      }

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013, //
        msg: getMessage(1013, languageCode),
        data: story,
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getStorySceneById(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let id = req.params.id;

      const storyScene = await StoryScenes.findById(id);

      if (!storyScene) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1031,
          msg: getMessage(1031, languageCode),
          data: null,
        });
      }

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: storyScene,
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async deleteStoryById(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let id = req.params.id;

      const story = await Story.findByIdAndDelete(id);

      if (!story) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1024,
          msg: getMessage(1024, languageCode),
          data: null,
        });
      }

      await StoryScenes.deleteMany({ storyId: id });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1029, //
        msg: getMessage(1029, languageCode),
        data: story,
      });
    } catch (error) {
      console.error("Error in getAllmannerTags:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async deleteStorySceneById(req: Request, res: Response) {
    const languageCode = (req.headers["language"] as string) || "en";
    try {
      const id = req.params.id;

      // Find scene to delete
      const scene = await StoryScenes.findById(id);
      if (!scene) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1030,
          msg: getMessage(1030, languageCode),
          data: null,
        });
      }

      // Delete the scene
      await StoryScenes.findByIdAndDelete(id);

      // Get remaining scenes of that story
      const storyScenes = await StoryScenes.find({
        storyId: scene.storyId,
      }).sort({ sceneNumber: 1 });

      // Reorder scenes whose sceneNumber > deleted one
      await Promise.all(
        storyScenes.map(async (s) => {
          if (s.sceneNumber > scene.sceneNumber) {
            const newSceneNumber = s.sceneNumber - 1;
            await StoryScenes.updateOne(
              { _id: s._id },
              { sceneNumber: newSceneNumber }
            );
          }
        })
      );

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1029,
        msg: getMessage(1029, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in deleteStorySceneById:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
}

export default new adminController();
