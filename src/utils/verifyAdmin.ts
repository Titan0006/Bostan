import { Request, Response, NextFunction } from "express";
import { Admin } from "../models/index.js";
import ResponseHandler from "./responseHandler.js";
import getMessage from "../i18n/index.js";

async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
    const languageCode = req.headers['language'] as string || "en";
    try {
        const user = (req as any).user;

        const userExists = await Admin.findById(user.id)

        if (!userExists) {
            return ResponseHandler.send(res, {
                statusCode: 401,
                status: "error",
                msgCode: 1018,
                msg: getMessage(1018, languageCode),
                data: null,
            });
        }
        next()
    } catch (error) {
        return ResponseHandler.send(res, {
            statusCode: 500,
            status: "error",
            msgCode: 500,
            msg: getMessage(500, languageCode),
            data: null,
        });
    }
}

export default verifyAdmin;