import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  deviceId: string;
  isSubscribed:boolean; 
}
