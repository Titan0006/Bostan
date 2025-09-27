import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ResponseHandler from "./responseHandler.js";
import getMessage from "../i18n/index.js";

async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const languageCode = req.headers['language'] as string || "en";
    try {
        const bearer_token = req.headers['authorization'] as string || ""

        const token = bearer_token.split(" ")[1];

        if (!token) {
            return ResponseHandler.send(res, {
                statusCode: 401,
                status: "error",
                msgCode: 1007,
                msg: getMessage(1007, languageCode),
                data: null
            })
        }
        let secret_key = "Secret_Key";
        const user_data = jwt.verify(token, secret_key) as JwtPayload

        (req as any).user = user_data;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        return ResponseHandler.send(res, {
            statusCode: 401,
            status: "error",
            msgCode: 500,
            msg: getMessage(500, languageCode),
            data: null
        })
    }
}

export default verifyToken;