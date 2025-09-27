import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  isActive: Boolean;
  isDelete: Boolean;
  comparePassword(candidatePassword:string):Promise<boolean>
}
