import { IReview } from "./interfaces/index.js";
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const reviewSchema = new Schema<IReview>(//rating,userId,storyId
  {
    rating: { type: Number, default:1, required: false },
    userId: { type: String, required: false }, //deviceId
    storyId: { type: Schema.Types.ObjectId, ref:'Story', required: false }, 
  },
  { timestamps: true }
);

const Review = model<IReview>("Review", reviewSchema, "Review");

export default Review;