import { Types } from "mongoose";

export interface IStory { 
  _id:Types.ObjectId;
  title:string,
  logo:string,
  base_poster:string,
  landscape_poster:string,
  portrait_poster:string,
  logline:string,
  plotSummary:string,
  status: string,
  mannerTags:string[],
  is_featured:boolean,
  banner_story:boolean
}
