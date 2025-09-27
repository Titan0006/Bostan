import { Request, Response } from "express";
import { User, OTP, Admin } from "../models/index.js";
import ResponseHandler from '../utils/responseHandler.js'
import getMessage from '../i18n/index.js'
import TwilioService from '../helpers/twilioService.js'
import EmailService from '../helpers/SendMail.js'
import { generateOTP } from "../utils/generateOTP.js";
import jwt from 'jsonwebtoken';

class userController {
    constructor() {
        this.getMyDetails = this.getMyDetails.bind(this);
        this.updateMyDetails = this.updateMyDetails.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }

    async getMyDetails(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
        try {
            const user = (req as any).user;

            const user_details = await User.findOne({ _id: user.id }).populate("-password");

            return ResponseHandler.send(res, {
                statusCode: 200,
                status: "success",
                msgCode: 1013,
                msg: getMessage(1013, languageCode),
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
    async updateMyDetails(req: Request, res: Response) {
        let languageCode = req.headers["language"] as string || "en";
        try {
            const user = (req as any).user;
            const body = req.body

            let user_details = await User.findByIdAndUpdate(user.id, body, { new: true });

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

            let user_details = await User.findById(user.id);
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
}

export default new userController();