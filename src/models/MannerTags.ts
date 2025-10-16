import { IMannerTags } from "./interfaces/index.js";
import { Schema, model } from "mongoose";

const mannerTagsSchema = new Schema<IMannerTags>(//tagName,category
  {
    tagName: { type: String, trim: true, required: false }, 
    type: { type: String, trim: true, required: false, default:"negative",enum:["negative","positive"] }
  },
  { timestamps: true }
);

const MannerTags = model<IMannerTags>("MannerTags", mannerTagsSchema, "MannerTags");

export default MannerTags;
