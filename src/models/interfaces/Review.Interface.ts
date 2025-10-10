import { Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  rating:number;
  userId:string;//we 'll use device id 
  storyId:Types.ObjectId;
}
