import { IUser } from "./interfaces/index.js";
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, trim: true, required: false },
    email: { type: String, trim: true, required: false, unique: true },
    password: { type: String, trim: true, required: false },
    isActive: { type: Boolean, default: true, required: false },
    isDelete: { type: Boolean, default: false, required: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password.toString(), 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword:string){
  return bcrypt.compare(candidatePassword,this.password);
}

const User = model<IUser>("User", userSchema, "User");

export default User;
