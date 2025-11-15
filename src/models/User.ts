import { IUser } from "./interfaces/index.js";
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema<IUser>(
  {
    full_name: { type: String, trim: true, required: false },
    email: { type: String, trim: true, required: false },
    password: { type: String, trim: true, required: false },
    subscription_plan: { 
      type: String,
      trim: true,
      required: false,
      default: "free_trial",
      enum: ["free_trial","unsubscribed", "monthly", "yearly"],
    },
    is_guest: { type: Boolean, default: false, required: false },
    is_active: { type: Boolean, default: true, required: false },
    has_cancelled_subscription: { type: Boolean, default: false, required: false },
    is_deleted: { type: Boolean, default: false, required: false },
  },
  { timestamps: true }
);

userSchema.pre('save',async function(next){
  if(!this.isModified('password')){
    return next();
  }
  try{
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
  }catch(error:any){
    next(error);
  }
})

userSchema.methods.comparePassword = async function (candidatePassword:string){
  return await bcrypt.compare(candidatePassword,this.password)
}

const User = model<IUser>("User", userSchema, "User");

export default User;
