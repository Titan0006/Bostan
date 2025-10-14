import { IUserActivity } from "./interfaces/index.js";
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

const UserActivity = model<IUserActivity>(
  "UserActivity",
  userActivitySchema,
  "UserActivity"
);

export default UserActivity;
