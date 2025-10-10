import { Request, Response } from "express";
import { User, OTP, Admin, Story, StoryScenes } from "../models/index.js";
import ResponseHandler from '../utils/responseHandler.js'
import getMessage from '../i18n/index.js'
import TwilioService from '../helpers/twilioService.js'
import EmailService from '../helpers/SendMail.js'
import { generateOTP } from "../utils/generateOTP.js";
import jwt from 'jsonwebtoken';


class adminController {
    constructor() {
        this.getMyDetails = this.getMyDetails.bind(this);
        this.updateMyDetails = this.updateMyDetails.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.udpateUserInfoById = this.udpateUserInfoById.bind(this);
        this.getUserInfoById = this.getUserInfoById.bind(this);
        this.getAllUsers = this.getAllUsers.bind(this);
    }

    async getMyDetails(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
        try {
            const user = (req as any).user;

            const admin_details = await Admin.findOne({ _id: user.id }).populate("-password");

            return ResponseHandler.send(res, {
                statusCode: 200,
                status: "success",
                msgCode: 1013,
                msg: getMessage(1013, languageCode),
                data: admin_details
            })
        } catch (error) {
            console.error("Error in userSignup of AuthController", error);
            return ResponseHandler.send(res, {
                statusCode: 500,
                status: "error",
                msgCode: 500,
                msg: getMessage(500, languageCode),
                data: null
            })
        }
    }
    async updateMyDetails(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
        try {
            const user = (req as any).user;
            const body = req.body

            let user_details = await Admin.findByIdAndUpdate(user.id, body, { new: true });

            return ResponseHandler.send(res, {
                statusCode: 200,
                status: "success",
                msgCode: 1014,
                msg: getMessage(1014, languageCode),
                data: user_details
            })
        } catch (error) {
            console.error("Error in userSignup of AuthController", error);
            return ResponseHandler.send(res, {
                statusCode: 500,
                status: "error",
                msgCode: 500,
                msg: getMessage(500, languageCode),
                data: null
            })
        }
    }
    async changePassword(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
        try {
            const user = (req as any).user;
            const { password } = req.body

            if (!password || password.trim() === "") {
                return ResponseHandler.send(res, {
                    statusCode: 400,
                    status: "error",
                    msgCode: 1016,
                    msg: getMessage(1016, languageCode),
                    data: null
                });
            }

            let user_details = await Admin.findById(user.id);
            if (user_details) {
                (user_details as any).password = password;
                await user_details.save()
            }
            return ResponseHandler.send(res, {
                statusCode: 200,
                status: "success",
                msgCode: 1015,
                msg: getMessage(1015, languageCode),
                data: null
            })
        } catch (error) {
            console.error("Error in userSignup of AuthController", error);
            return ResponseHandler.send(res, {
                statusCode: 500,
                status: "error",
                msgCode: 500,
                msg: getMessage(500, languageCode),
                data: null
            })
        }
    }
    async udpateUserInfoById(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
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
                    data: null
                })
            }

            if ((body.isDelete && body.isDelete === true) || body.isActive === false) {

            }
            const updated_user = await User.findByIdAndUpdate(id, body, { new: true });
            return ResponseHandler.send(res, {
                statusCode: 200,
                status: "success",
                msgCode: 1014,
                msg: getMessage(1014, languageCode),
                data: updated_user
            })
        } catch (error) {
            console.error("Error in userSignup of AuthController", error);
            return ResponseHandler.send(res, {
                statusCode: 500,
                status: "error",
                msgCode: 500,
                msg: getMessage(500, languageCode),
                data: null
            })
        }
    }
    async getUserInfoById(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
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
                    data: null
                })
            }

            return ResponseHandler.send(res, {
                statusCode: 200,
                status: "success",
                msgCode: 1013,
                msg: getMessage(1013, languageCode),
                data: null
            })
        } catch (error) {
            console.error("Error in userSignup of AuthController", error);
            return ResponseHandler.send(res, {
                statusCode: 500,
                status: "error",
                msgCode: 500,
                msg: getMessage(500, languageCode),
                data: null
            })
        }
    }
    async getAllUsers(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
        try {
            const admin = (req as any).user;

            const users = await User.find({});

            return ResponseHandler.send(res, {
                statusCode: 200,
                status: "success",
                msgCode: 1013,
                msg: getMessage(1013, languageCode),
                data: users
            })
        } catch (error) {
            console.error("Error in userSignup of AuthController", error);
            return ResponseHandler.send(res, {
                statusCode: 500,
                status: "error",
                msgCode: 500,
                msg: getMessage(500, languageCode),
                data: null
            })
        }
    }
    async createStoryWithScenes(req: Request, res: Response) {
        let languageCode = (req.headers["language"] as string) || "en"; 
        try {
            const { story, scenes } = req.body;

            if (!story) {
                return ResponseHandler.send(res, {
                    statusCode: 400,
                    status: "error",
                    msgCode: 1021, // 🔹 choose a msgCode for "Story data required"
                    msg: getMessage(1021, languageCode),
                    data: null,
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
                statusCode: 201,
                status: "success",
                msgCode: 1014, // 
                msg: getMessage(1014, languageCode),
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
}

export default new adminController();