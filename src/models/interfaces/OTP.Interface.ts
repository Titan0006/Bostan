import { ObjectId } from "mongoose";

export interface IOTP {
    otp:string,
    type: "email" | "phone",
    user_type:"user" | "admin",
    user_id: string,
    email:string,
    phone_number:string
}