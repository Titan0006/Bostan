import { Types } from "mongoose";

export interface IMannerTags {
  _id:Types.ObjectId;
  tagName:string;
  type:'positive' | 'negative';
}
