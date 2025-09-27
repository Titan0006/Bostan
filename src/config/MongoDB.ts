import mongoose from 'mongoose';


export const connectDB = async(mongoURI:string) => {
    try {
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB connected succesfully")
    } catch (error:any) {
        console.error("Error in Connecting DB", error)
        throw new Error(error)
    }
}