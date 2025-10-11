import { IStoryView } from "./interfaces/index.js";
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const storyViewSchema = new Schema<IStoryView>(//userId,storyId
  {
    userId: { type: Schema.Types.ObjectId, ref:'User', required: false },
    storyId: { type: Schema.Types.ObjectId, ref:'Story', required: false }
  },
  { timestamps: true }
);

const StoryView = model<IStoryView>("StoryView", storyViewSchema, "StoryView");

export default StoryView;
