import { Types } from "mongoose";

export interface IUser { 
  _id: Types.ObjectId;
  first_name:string;
  last_name:string;
  email:string;
  password:string;
  subscription_plan:string;
  is_active:boolean;
  is_deleted:boolean;
  comparePassword(candidatePassword:string):Promise<boolean>;
}
