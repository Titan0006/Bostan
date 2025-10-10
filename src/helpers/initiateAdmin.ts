import { Admin } from "../models/index.js";

export const initiateAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ email: 'admin@gmail.com' });

        if (!adminExists) {
            await Admin.create({
                email: 'admin@gmail.com',
                password: 'Password@123'
            })
        }
    } catch (error) {
        console.error(error);
    }
}