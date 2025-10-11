import { IStoryReview } from "./interfaces/index.js";
import { Schema, model } from "mongoose";

const storyReviewSchema = new Schema<IStoryReview>( // poster,logo,logline,plotSummary,mannerTags
 {
  storyId:{type:Schema.Types.ObjectId,ref:'Story'},
  userId:{type:Schema.Types.ObjectId,ref:'User'},
  rating:{type:Number,default:0,required:true}
 },
  { timestamps: true }
);

const StoryReview = model<IStoryReview>("StoryReview", storyReviewSchema, "StoryReview");

export default StoryReview;