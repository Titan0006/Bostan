import { Request, Response, NextFunction } from "express";
import { User } from "../models/index.js";
import ResponseHandler from "./responseHandler.js";
import getMessage from "../i18n/index.js";

async function verifyUser(req: Request, res: Response, next: NextFunction) {
    const languageCode = req.headers['language'] as string || "en";
    try {
        const user = (req as any).user;

        const userExists = await User.findById(user.id)

        if (!userExists) {
            return ResponseHandler.send(res, {
                statusCode: 401,
                status: "error",
                msgCode: 1008,
                msg: getMessage(1008, languageCode),
                data: null,
            });
        }

        if (userExists.isDelete) {
            return ResponseHandler.send(res, {
                statusCode: 401,
                status: "error",
                msgCode: 1008,
                msg: getMessage(1019, languageCode),
                data: null,
            });
        }

        if (!userExists.isActive) {
            return ResponseHandler.send(res, {
                statusCode: 401,
                status: "error",
                msgCode: 1020,
                msg: getMessage(1020, languageCode),
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

export default verifyUser;