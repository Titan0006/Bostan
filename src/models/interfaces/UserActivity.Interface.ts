import { Types } from "mongoose";

export interface IUserActivity { 
  _id: Types.ObjectId;
  userId:Types.ObjectId;
}
