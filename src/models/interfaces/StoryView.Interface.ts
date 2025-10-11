import { Types } from "mongoose";

export interface IStoryView {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  storyId:Types.ObjectId;
}
