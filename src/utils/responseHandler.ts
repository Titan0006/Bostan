// responseHandler.js
import { Response } from "express";
import { IResponseOptions } from "../models/interfaces/index";

class ResponseHandler {
    send(res: any, {
        statusCode = 200,
        status = "success",
        msgCode = "",
        msg = "",
        data = null
    }: IResponseOptions): Response {
        return res.status(statusCode).json({
            status,      // "success" or "error"
            msgCode,     // optional code for frontend
            msg: msg, // readable message
            data         // payload
        });
    }
}

export default new ResponseHandler();
