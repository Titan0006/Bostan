import { IStory } from "./interfaces/index.js";
import { Schema, model } from "mongoose";

const storySchema = new Schema<IStory>( // poster,logo,logline,plotSummary,mannerTags
  {
    posters: [{ type: String, trim: true, required: false }],
    plotSummary: { type: String, trim: true, required: false },
    logo: { type: String, trim: true, required: false },
    logline: { type: String, default: "", required: false },
    status: { type: String, default: "draft",enum:['draft','published'], required: false },
    mannerTags: [{ type: Schema.Types.ObjectId, ref: 'MannerTags', index: true }],
  },
  { timestamps: true }
);

const Story = model<IStory>("Story", storySchema, "Story");

export default Story;