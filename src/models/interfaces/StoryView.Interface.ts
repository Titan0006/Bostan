import { Types } from "mongoose";

export interface IStoryView {
  _id: Types.ObjectId;
  userId: string;
  storyId:Types.ObjectId;
}
