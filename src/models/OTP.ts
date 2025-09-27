import { IOTP } from "./interfaces/index.js";
import { Schema, model } from "mongoose";

const otpSchema = new Schema<IOTP>(
  {
    otp: { type: String, trim: true, required: false }, 
    type: { type: String, trim: true, required: false, default:"email",enum:["email","phone_number"] },
    user_type: { type: String, trim: true, required: false ,default:'user'},
    user_id: { type: String, trim: true, required: false,default:'' },
    email: { type: String, trim: true, required: false,default:'' },
    phone_number: { type: String, trim: true, required: false,default:'' },
  },
  { timestamps: true }
);

const OTP = model<IOTP>("OTP", otpSchema, "OTP");

export default OTP;
