import { IAdmin } from "./interfaces/Admin.Interface.js";
import {Schema,model} from "mongoose";

const adminSchema = new Schema<IAdmin>({
    email: { type: String, trim: true, required: false},
    password: { type: String, trim: true, required: false }
},{
    timestamps:true
})

const Admin = model<IAdmin>("Admin",adminSchema,"Admin");

export default Admin;