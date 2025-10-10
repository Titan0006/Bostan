import { IStoryScenes } from "./interfaces/index.js";
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const storySceneSchema = new Schema<IStoryScenes>(// text,image,sceneNumber,storyId
  {
    text: { type: String, trim: true, required: false },
    image: { type: String, default: "",trim:true, required: false },
    sceneNumber:{type:Number,default:1,required:false},
    storyId:{type:Schema.Types.ObjectId,ref:'Story'}
  },
  { timestamps: true }
);

const StoryScenes = model<IStoryScenes>("StoryScene", storySceneSchema, "StoryScene");

export default StoryScenes;
