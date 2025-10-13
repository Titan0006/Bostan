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
      }).sort({ createdAt: -1 }).lean();

      // add other things with banner like total_number_of_reviews, total_number_of_readers,average_rating,min_minutes_to_read,total_scenes

      banner_stories = await Promise.all(
        banner_stories.map(async(story:any)=>{
            let total_number_of_reviews = await StoryReview.countDocuments({storyId:story._id});
            let total_number_of_readers = await StoryView.countDocuments({storyId:story._id});
            let total_reviews = await StoryReview.find({storyId:story._id}).select('rating');
            console.log("total_reviewsssssssssssssssssssssssssss",total_reviews)
            let total_rating_of_all_reviews = total_reviews.reduce((sum:any,arr:any)=>sum+Number(arr.rating),0);
            let average_rating = Number(total_rating_of_all_reviews)/total_reviews.length;
            let total_scenes = await StoryScenes.countDocuments({storyId:story._id});
            let min_minutes_to_read = total_scenes*3;
            return {...story,total_number_of_reviews,total_number_of_readers,average_rating,min_minutes_to_read,total_scenes}
        })
      );

      let new_stories = await Story.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(4);

      let story_of_the_week = await StoryOfTheWeek.findOne({}).populate(
        "storyId"
      );

      let featured_stories = await Story.find({ is_featured: true }).sort({
        creatdeAt: -1,
      }).lean();

      featured_stories = await Promise.all(
        featured_stories.map(async(story:any)=>{
            let all_readers = await StoryView.countDocuments({storyId:story._id})
            return {...story,total_number_of_readers:Number(all_readers)>0?Number(all_readers):0}
        })
      )

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
        let all_stories = await Story.find({}).lean().sort({createdAt:-1});
        
        all_stories = await Promise.all(
            all_stories.map(async(story:any)=>{
                let total_scenes = await StoryScenes.countDocuments({storyId:story._id});
                let min_minutes_to_read = Number(total_scenes)*3;
                return {...story,total_scenes,min_minutes_to_read}
            })
        )

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
  async viewStory(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      let userId = (req as any).user.id;
      let storyId = (req as any).params.id;

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

      await StoryView.create({ storyId, userId });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: story,
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
      let id = req.params.id;
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

      if (id) {
        await StoryReview.findByIdAndUpdate(id, { rating });
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
}

export default new userController();
