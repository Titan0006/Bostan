import { Types } from "mongoose";

export interface IStory { 
  _id:Types.ObjectId;
  posters:string[],
  logo:string,
  logline:string,
  plotSummary:string,
  status: string,
  mannerTags:Types.ObjectId[]
}
