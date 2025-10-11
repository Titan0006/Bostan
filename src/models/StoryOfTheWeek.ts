import { IStoryOfTheWeek } from "./interfaces/index.js";
import { Schema, model } from "mongoose";

const storyOfTheWeekSchema = new Schema<IStoryOfTheWeek>( // poster,logo,logline,plotSummary,mannerTags
 {
  storyId:{type:Schema.Types.ObjectId,ref:'Story'}
 },
  { timestamps: true }
);

const StoryOfTheWeek = model<IStoryOfTheWeek>("StoryOfTheWeek", storyOfTheWeekSchema, "StoryOfTheWeek");

export default StoryOfTheWeek;
