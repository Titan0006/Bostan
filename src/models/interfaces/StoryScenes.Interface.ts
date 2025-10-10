import { Types } from "mongoose";

export interface IStoryScenes {
  _id: Types.ObjectId;
  text: string;
  image:string;
  sceneNumber:number;
  storyId:Types.ObjectId;
}
