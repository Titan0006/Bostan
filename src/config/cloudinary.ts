import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export interface CloudinaryUploadResult {
    url: string;
    public_id: string;
    resource_type: string;
}

export const uploadFile = async (localFilePath: string, folder: string = "uploads"): Promise<CloudinaryUploadResult> => {
    if (!localFilePath) throw new Error("No file path provided");
    try {
        const result = await cloudinary.uploader.upload(localFilePath, { folder });

        if (fs.existsSync(localFilePath)) {
            await fs.promises.unlink(localFilePath);
        }

        return {
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type
        }
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Remove local file if exists
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        throw error;
    }
}