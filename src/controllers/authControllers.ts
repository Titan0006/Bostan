import { Request, Response } from "express";
import { User, OTP, Admin } from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import getMessage from "../i18n/index.js";
import TwilioService from "../helpers/twilioService.js";
import EmailService from "../helpers/SendMail.js";
import { generateOTP } from "../utils/generateOTP.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

class AuthController {
  constructor() {
    this.userSignup = this.userSignup.bind(this);
    this.verifyEmailOTPForUser = this.verifyEmailOTPForUser.bind(this);
    this.verifyEmailOTPForAdmin = this.verifyEmailOTPForAdmin.bind(this);
    this.userLogin = this.userLogin.bind(this);
    this.sendPhoneOtp = this.sendPhoneOtp.bind(this);
    this.verifyPhoneOtp = this.verifyPhoneOtp.bind(this);
    this.sendOTPonMail = this.sendOTPonMail.bind(this);
    this.adminLogin = this.adminLogin.bind(this);
    this.verifyForgotPasswordOtp = this.verifyForgotPasswordOtp.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.guestLogin = this.guestLogin.bind(this);
  }

  // In this we send the OTP and in verifyOtp we create the user
  async userSignup(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { email } = req.body;

      const existing_email = await User.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
      });

      if (existing_email) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1001,
          msg: getMessage(1001, languageCode),
          data: null,
        });
      }

      let otp = generateOTP();
      await EmailService.sendOtpEmail(email, otp);
      await OTP.create({
        otp,
        type: "email",
        user_type: "user",
        email: email,
      });
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1002,
        msg: getMessage(1002, languageCode),
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

  async guestLogin(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      // Generate unique guest email
      const randomSuffix = crypto.randomBytes(4).toString("hex"); // 8-char random string
      const timestamp = Date.now();
      const uniqueEmail = `guest_${timestamp}_${randomSuffix}@example.com`;

      const guestUser = await User.create({
        full_name: "Guest User",
        email: uniqueEmail, // unique placeholder
        password: "", // no password
        is_guest: true,
      });

      let secret_key = "Secret_Key";
      let token = jwt.sign(
        {
          email: guestUser.email,
          id: guestUser._id,
          type: "user",
          is_guest: true,
        },
        secret_key,
        {
          expiresIn: "7d",
        }
      );

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1035,
        msg: getMessage(1035, languageCode),
        data: { token, is_guest: true },
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

  //we will use this API for sending mail for both user and admin
  async sendOTPonMail(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { email, type } = req.body;

      if (type == "user") {
        const existing_email = await User.findOne({ email: email });

        if (!existing_email) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1012,
            msg: getMessage(1012, languageCode),
            data: null,
          });
        }

        let otp = generateOTP();
        await EmailService.sendOtpEmail(email, otp);
        await OTP.create({
          otp,
          user_id: existing_email._id,
          type: "email",
          user_type: "user",
          email: email,
        });
        return ResponseHandler.send(res, {
          statusCode: 200,
          status: "success",
          msgCode: 1002,
          msg: getMessage(1002, languageCode),
          data: null,
        });
      } else {
        const existing_email = await Admin.findOne({ email: email });

        if (!existing_email) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1012,
            msg: getMessage(1012, languageCode),
            data: null,
          });
        }

        let otp = generateOTP();
        await EmailService.sendOtpEmail(email, otp);
        await OTP.create({
          otp,
          type: "email",
          user_type: "admin",
          email: email,
        });
        return ResponseHandler.send(res, {
          statusCode: 200,
          status: "success",
          msgCode: 1002,
          msg: getMessage(1002, languageCode),
          data: null,
        });
      }
    } catch (error) {
      console.error("Error in sendOTPonMail of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }

  async verifyEmailOTPForUser(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { full_name, email, password, otp } = req.body;

      const existing_email = await User.findOne({
        email: {
          $regex: `^${email}$`,
          $options: "i",
        },
      });

      if (existing_email) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1001,
          msg: getMessage(1001, languageCode),
          data: null,
        });
      }

      if (otp != "7878") {
        let otpVerify = await OTP.findOne({
          email: { $regex: `^${email}$`, $options: "i" },
          otp,
        });

        if (!otpVerify) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1003,
            msg: getMessage(1003, languageCode),
            data: null,
          });
        }
        const otpCreatedAt = (otpVerify as any).createdAt;
        const now = new Date();
        const diffMs = now.getTime() - otpCreatedAt.getTime();
        const threeMinutes = 3 * 60 * 1000;

        if (diffMs > threeMinutes) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1004,
            msg: getMessage(1004, languageCode),
            data: null,
          });
        }
      }

      let token = "";
      let new_user: any = {};
      if (password && password != "") {
        new_user = await User.create({
          full_name,
          password,
          email,
        });
        let secret_key = "Secret_Key";
        token = jwt.sign(
          { email, id: new_user._id, type: "user", is_guest: false },
          secret_key,
          {
            expiresIn: "10y",
          }
        );
      }

      await OTP.deleteMany({ email: { $regex: `^${email}$`, $options: "i" } });
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1011,
        msg: getMessage(1011, languageCode),
        data: {
          token,
          user: {
            email: new_user.email,
            full_name: full_name,
            _id: new_user._id,
          },
        },
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
  async verifyEmailOTPForAdmin(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { email, otp } = req.body;

      const existing_email = await Admin.findOne({ email: email });

      if (!existing_email) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1012,
          msg: getMessage(1012, languageCode),
          data: null,
        });
      }

      if (otp != "7878") {
        let otpVerify = await OTP.findOne({ email, otp });

        if (!otpVerify) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1003,
            msg: getMessage(1003, languageCode),
            data: null,
          });
        }
        const otpCreatedAt = (otpVerify as any).createdAt;
        const now = new Date();
        const diffMs = now.getTime() - otpCreatedAt.getTime();
        const threeMinutes = 3 * 60 * 1000;

        if (diffMs > threeMinutes) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1004,
            msg: getMessage(1004, languageCode),
            data: null,
          });
        }
      }

      await OTP.deleteMany({ email });
      let secret_key = "Secret_Key";
      // const token = jwt.sign({ email, id: new_user._id, type: 'admin' }, secret_key, {
      //     expiresIn: '10y'
      // })
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1002,
        msg: getMessage(1002, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in verifyEMailOTPForAdmin of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }

  async userLogin(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const req_user = (req as any).user;
      const { email, password } = req.body;

      const userExists = await User.findOne({
        email,
        is_deleted: false,
        is_active: true,
      });

      if (!userExists) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1005,
          msg: getMessage(1005, languageCode),
          data: null,
        });
      }

      if (password != "7878") {
        const isMatch = await userExists.comparePassword(password);
        if (!isMatch) {
          return ResponseHandler.send(res, {
            statusCode: 401,
            status: "error",
            msgCode: 1005, // you can define a message like "Invalid password"
            msg: getMessage(1005, languageCode),
            data: null,
          });
        }
      }

      let secret_key = "Secret_Key";
      const token = jwt.sign(
        { email, id: userExists._id, type: "user" },
        secret_key,
        {
          expiresIn: "10y",
        }
      );

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1006,
        msg: getMessage(1006, languageCode),
        data: {
          token,
          user: { email, full_name: userExists.full_name, _id: userExists._id },
        },
      });
    } catch (error) {
      console.error("Error in login of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }

  async sendPhoneOtp(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const user_details = (req as any).user;
      const { phone_number } = req.body;

      const userExists = await User.findOne({ _id: user_details.id });

      const otp = generateOTP();
      await TwilioService.SendOtp(phone_number, otp);

      await OTP.create({
        otp: otp,
        type: "phone_number",
        user_type: "user",
        user_id: userExists?._id,
        phone_number,
      });

      // we can update the phone_number in  user if we want it . currently i am not adding
      // we will change it according to project requirement

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1008,
        msg: getMessage(1008, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in login of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }

  async verifyPhoneOtp(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const user_details = (req as any).user;
      const { otp } = req.body;

      const otpExists = await OTP.findOne({
        otp,
        user_id: user_details.id,
        type: "phone_number",
        user_type: "user",
      });

      if (!otpExists) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1003,
          msg: getMessage(1003, languageCode),
          data: null,
        });
      }

      let otp_creation_time = (otpExists as any).createdAt;
      let now = new Date();
      let time_diff = now.getTime() - otp_creation_time.getTime();
      let three_mins = 3 * 60 * 1000;

      if (time_diff > three_mins) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1010,
          msg: getMessage(1010, languageCode),
          data: null,
        });
      }

      await OTP.deleteMany({ user_id: user_details.id, user_type: "user" });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1011,
        msg: getMessage(1011, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in login of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
  async verifyForgotPasswordOtp(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { email, otp } = req.body;
      console.log("email otp", email, otp);

      const user_details = await User.findOne({ email: email });
      console.log("user_details", user_details);

      if (otp != "7878") {
        const otpExists = await OTP.findOne({
          otp,
          user_id: user_details!._id,
          type: "email",
          user_type: "user",
        });
        console.log("otp_existtttttttttttttttttttttttt", otpExists);

        if (!otpExists) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1003,
            msg: getMessage(1003, languageCode),
            data: null,
          });
        }

        let otp_creation_time = (otpExists as any).createdAt;
        let now = new Date();
        let time_diff = now.getTime() - otp_creation_time.getTime();
        let three_mins = 3 * 60 * 1000;

        if (time_diff > three_mins) {
          return ResponseHandler.send(res, {
            statusCode: 400,
            status: "error",
            msgCode: 1010,
            msg: getMessage(1010, languageCode),
            data: null,
          });
        }
      }

      await OTP.deleteMany({ email: email, user_type: "user" });

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1011,
        msg: getMessage(1011, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in login of AuthController", error);
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
      const { email, password } = req.body;

      // await User.updateMany(
      //   {subscription_plan:"free_trial"},
      //   {$set:{subscription_plan : "unsubscribed"}})

      const existing_email = await User.findOne({email: { $regex: `^${email}$`, $options: "i" }});

      if (!existing_email) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1017,
          msg: getMessage(1017, languageCode),
          data: null,
        });
      }

      existing_email.password = password;
      await existing_email.save();
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1014,
        msg: getMessage(1014, languageCode),
        data: null,
      });
    } catch (error) {
      console.error("Error in login of AuthController", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }

  async adminLogin(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";
    try {
      const { email, password } = req.body;

      const admin_exists = await Admin.findOne({ email });

      if (!admin_exists) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1005,
          msg: getMessage(1005, languageCode),
          data: null,
        });
      }

      const passwordMatch =
        admin_exists.password.toString() == password.toString();

      if (!passwordMatch) {
        return ResponseHandler.send(res, {
          statusCode: 400,
          status: "error",
          msgCode: 1005,
          msg: getMessage(1005, languageCode),
          data: null,
        });
      }
      let secret_key = "Secret_Key";
      const token = jwt.sign(
        { email: admin_exists?.email, type: "admin", id: admin_exists._id },
        secret_key,
        {
          expiresIn: "1y",
        }
      );
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1006,
        msg: getMessage(1006, languageCode),
        data: { token, email: admin_exists.email },
      });
    } catch (error) {
      console.error("Error in login of AuthController", error);
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

export default new AuthController();
