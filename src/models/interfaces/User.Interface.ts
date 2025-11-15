import { Types } from "mongoose";

export interface IUser { 
  _id: Types.ObjectId;
  full_name:string;
  email:string;
  password:string;
  subscription_plan:string;
  is_active:boolean;
  is_deleted:boolean;
  is_guest:boolean;
  has_cancelled_subscription:boolean;
  comparePassword(candidatePassword:string):Promise<boolean>;
}
