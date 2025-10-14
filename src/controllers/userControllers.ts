import { Request, Response } from "express";
import {
  User,
  OTP,
  Admin,
  Story,
  StoryOfTheWeek,
  StoryView,
  StoryReview,
  StoryScenes,
  UserActivity,
} from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import getMessage from "../i18n/index.js";
import TwilioService from "../helpers/twilioService.js";
import EmailService from "../helpers/SendMail.js";
import { generateOTP } from "../utils/generateOTP.js";
import jwt from "jsonwebtoken";
import { uploadFile } from "../config/cloudinary.js";

class userController {
  constructor() {
    this.getMyDetails = this.getMyDetails.bind(this);
    this.updateMyDetails = this.updateMyDetails.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.getDashboard = this.getDashboard.bind(this);
    this.getLibrary = this.getLibrary.bind(this);
    this.viewStory = this.viewStory.bind(this);
    this.createReviewOfStory = this.createReviewOfStory.bind(this);
    this.getAllStoriesAccordingToFilter =
      this.getAllStoriesAccordingToFilter.bind(this);
    this.getRandomStories = this.getRandomStories.bind(this);
    this.getAllMyReviews = this.getAllMyReviews.bind(this);
  }

  async getMyDetails(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const user = (req as any).user;

      const user_details = await User.findOne({ _id: user.id }).populate(
        "-password"
      );

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
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
  async updateMyDetails(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const user = (req as any).user;
      const body = req.body;

      let user_details = await User.findByIdAndUpdate(user.id, body, {
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

      let user_details = await User.findById(user.id);
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
  async uploadFile(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      console.log("Incoming fileeeeeeeeeeee", (req as any).files[0]);
      if (!req.files) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1022,
          msg: getMessage(1022, languageCode),
          data: null,
        });
      }
      const result = await uploadFile(
        (req as any).files[0].path,
        "bostan_app_file"
      );
      console.log("Resulttttttttttttttttttttttt", result);

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1023,
        msg: getMessage(1023, languageCode),
        data: result.url,
      });
    } catch (error) {
      console.error("Error in uploadFile of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getDashboard(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let banner_stories = await Story.find({
        status: "published",
        banner_story: true,
      })
        .sort({ createdAt: -1 })
        .lean();

      // add other things with banner like total_number_of_reviews, total_number_of_readers,average_rating,min_minutes_to_read,total_scenes

      banner_stories = await Promise.all(
        banner_stories.map(async (story: any) => {
          let total_number_of_reviews = await StoryReview.countDocuments({
            storyId: story._id,
          });
          let total_number_of_readers = await StoryView.countDocuments({
            storyId: story._id,
          });
          let total_reviews = await StoryReview.find({
            storyId: story._id,
          }).select("rating");
          console.log("total_reviewsssssssssssssssssssssssssss", total_reviews);
          let total_rating_of_all_reviews = total_reviews.reduce(
            (sum: any, arr: any) => sum + Number(arr.rating),
            0
          );
          let average_rating =
            Number(total_rating_of_all_reviews) / total_reviews.length;
          let total_scenes = await StoryScenes.countDocuments({
            storyId: story._id,
          });
          let min_minutes_to_read = total_scenes * 3;
          return {
            ...story,
            total_number_of_reviews,
            total_number_of_readers,
            average_rating,
            min_minutes_to_read,
            total_scenes,
          };
        })
      );

      let new_stories = await Story.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(4);

      let story_of_the_week = await StoryOfTheWeek.findOne({}).populate(
        "storyId"
      );

      let featured_stories = await Story.find({
        status: "published",
        is_featured: true,
      })
        .sort({
          creatdeAt: -1,
        })
        .lean();

      featured_stories = await Promise.all(
        featured_stories.map(async (story: any) => {
          let all_readers = await StoryView.countDocuments({
            storyId: story._id,
          });
          return {
            ...story,
            total_number_of_readers:
              Number(all_readers) > 0 ? Number(all_readers) : 0,
          };
        })
      );

      let userId = (req as any).user.id;

      const twentyFourHourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentActivity = await UserActivity.findOne({
        userId: userId,
        createdAt: { $gte: twentyFourHourAgo },
      });

      if (!recentActivity) {
        await UserActivity.create({ userId });
      }

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: {
          banner_stories,
          new_stories,
          story_of_the_week,
          featured_stories,
        },
      });
    } catch (error) {
      console.error("Error in getDashboard of user", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getLibrary(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let all_stories = await Story.find({ status: "published" })
        .lean()
        .sort({ createdAt: -1 });

      all_stories = await Promise.all(
        all_stories.map(async (story: any) => {
          let total_scenes = await StoryScenes.countDocuments({
            storyId: story._id,
          });
          let min_minutes_to_read = Number(total_scenes) * 3;
          return { ...story, total_scenes, min_minutes_to_read };
        })
      );

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: all_stories,
      });
    } catch (error) {
      console.error("Error in getDashboard of user", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getRandomStories(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let stories = await Story.aggregate([
        { $match: { status: "published" } },
        {
          $sample: { size: 5 },
        },
      ]);

      stories = await Promise.all(
        stories.map(async (story: any) => {
          let total_scenes = await StoryScenes.countDocuments({
            storyId: story._id,
          });
          let min_minutes_to_read = Number(total_scenes) * 3;
          return { ...story, total_scenes, min_minutes_to_read };
        })
      );

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: stories,
      });
    } catch (error) {
      console.error("Error in getDashboard of user", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async viewStory(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let userId = (req as any).user.id;
      let storyId = (req as any).params.id;

      let story = await Story.findById(storyId).lean();

      if (!story || story.status != "published") {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1024,
          msg: getMessage(1024, languageCode),
          data: null,
        });
      }

      await StoryView.create({ storyId, userId });

      const getAllScenes = await StoryScenes.find({
        storyId: story._id,
      }).lean();

      const total_number_of_reviews = await StoryReview.countDocuments({
        storyId: story._id,
      }).lean();
      const total_number_of_readers = await StoryView.countDocuments({
        storyId: story._id,
      }).lean();
      const all_reviews = await StoryReview.find({ storyId: story._id }).lean();
      let all_ratings = all_reviews.reduce(
        (sum, a) => sum + Number(a.rating),
        0
      );
      let sum = Number(all_ratings / total_number_of_reviews);
      const average_rating = sum > 0 ? sum : sum == 0 ? 0 : null;
      const min_minutes_to_read = getAllScenes.length * 3;
      const total_scenes = getAllScenes.length;

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: {
          ...story,
          total_number_of_reviews,
          total_number_of_readers,
          average_rating,
          min_minutes_to_read,
          total_scenes,
          scenes: getAllScenes,
        },
      });
    } catch (error) {
      console.error("Error in getDashboard of user", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async createReviewOfStory(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let userId = (req as any).user.id;
      let { storyId, rating } = req.body;
      let story = await Story.findById(storyId);

      if (!story) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1024,
          msg: getMessage(1024, languageCode),
          data: null,
        });
      }

      let doesEntryExist = await StoryReview.findOne({
        userId,storyId
      })

      if (doesEntryExist) {
        await StoryReview.findByIdAndUpdate(doesEntryExist._id, { rating });
        return ResponseHandler.send(res, {
          statusCode: 200,
          status: "success",
          msgCode: 1034,
          msg: getMessage(1034, languageCode),
          data: null,
        });
      } else {
        await StoryReview.create({ storyId, userId, rating });
        return ResponseHandler.send(res, {
          statusCode: 200,
          status: "success",
          msgCode: 1033,
          msg: getMessage(1033, languageCode),
          data: null,
        });
      }
    } catch (error) {
      console.error("Error in getDashboard of user", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  //   async getAllStoriesAccordingToFilter(req: Request, res: Response) {
  //     let languageCode = (req.headers["language"] as string) || "en";
  //     try {
  //       let search = req.query.search as string; // both mannerTags and search query for title and description will come here
  //       let limit = Number(req.query.limit) || 10;
  //       let page = Number(req.query.page) || 1;
  //       let skip = (page - 1) * limit;
  //       let filter: any = {};

  //       if (search && search.trim() != "") {
  //         let regex = new RegExp(search, "i");
  //         filter.$or = [
  //           { plotSummary: regex },
  //           { logline: regex },
  //           { positiveMannerTags: { $elemMatch: { $regex: regex } } },
  //           { negativeMannerTags: { $elemMatch: { $regex: regex } } },
  //         ];
  //       }

  //       let stories = await Story.find(filter).skip(skip).limit(limit);

  //       return ResponseHandler.send(res, {
  //         statusCode: 200,
  //         status: "success",
  //         msgCode: 1034,
  //         msg: getMessage(1034, languageCode),
  //         data: stories,
  //       });
  //     } catch (error) {
  //       console.error("Error in getDashboard of user", error);
  //       return ResponseHandler.send(res, {
  //         statusCode: 500,
  //         status: "error",
  //         msgCode: 500,
  //         msg: getMessage(500, languageCode),
  //         data: null,
  //       });
  //     }
  //   }
  async getAllStoriesAccordingToFilter(req: Request, res: Response) {
    const languageCode = (req.headers["language"] as string) || "en";

    try {
      // 🔍 Get search query
      const search = (req.query.search as string) || "";

      // 🔢 Parse pagination params
      //   let limit = Number(req.query.limit);
      //   let page = Number(req.query.page);

      // ✅ Apply defaults if missing or invalid
      //   if (!page || page <= 0) page = 1;
      //   if (isNaN(limit) || limit < 0) limit = 10; // default 10 if negative or invalid

      //   const skip = (page - 1) * limit;

      // 🗂️ Build filter
      const filter: any = { status: "published" };

      if (search.trim() !== "") {
        const regex = new RegExp(search, "i");
        filter.$or = [
          { plotSummary: regex },
          { logline: regex },
          { positiveMannerTags: { $elemMatch: { $regex: regex } } },
          { negativeMannerTags: { $elemMatch: { $regex: regex } } },
        ];
      }

      // 🧮 Total count for pagination
      //   const totalCount = await Story.countDocuments(filter);
      //   const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 1;

      // 📖 Fetch stories based on limit
      let stories: any[] = [];

      stories = await Story.find(filter).sort({ createdAt: -1 }).lean();

      // Add scenes info
      stories = await Promise.all(
        stories.map(async (s: any) => {
          const all_scenes = await StoryScenes.find({
            storyId: s._id,
          }).lean();
          return {
            ...s,
            total_scenes: all_scenes.length,
            min_minutes_to_read: all_scenes.length * 3,
          };
        })
      );

      // ✅ Send response
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: {
          stories,
        },
      });
    } catch (error) {
      console.error("Error in getAllStoriesAccordingToFilter:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async getAllMyReviews(req: Request, res: Response) {
    const languageCode = (req.headers["language"] as string) || "en";

    try {
      let userId = (req as any).user.id;
      let all_reviews = await StoryReview.find({ userId: userId })
        .populate("storyId")
        .lean();

      all_reviews = await Promise.all(
        all_reviews.map(async (r: any) => {
          let no_of_readers = await StoryView.countDocuments({
            storyId: (r as any).storyId._id,
          }).lean();
          return { ...r, no_of_readers };
        })
      );

      // ✅ Send response
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: all_reviews,
      });
    } catch (error) {
      console.error("Error in getAllStoriesAccordingToFilter:", error);
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

export default new userController();
