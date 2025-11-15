import { Request, Response } from "express";
import {
  User
} from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import getMessage from "../i18n/index.js";

class userController {
  constructor() {
    this.webhook = this.webhook.bind(this);
  }

  async webhook(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";

    try {
      
      // ----------------------------------------------------
      // 1️⃣ Safe parse RevenueCat raw body (Buffer → JSON)
      // ----------------------------------------------------
      let raw = req.body;
      let body;
      
      console.log("Raw body:", raw)
      if (Buffer.isBuffer(raw)) {
        raw = raw.toString("utf8");
      }

      try {
        body = JSON.parse(raw);
      } catch (err) {
        console.error("❌ Failed to parse webhook body:", err);
        return res.status(400).json({ error: "Invalid JSON" });
      }

      // ----------------------------------------------------
      // 2️⃣ Extract event data safely
      // ----------------------------------------------------
      const event = body.event || {};
      console.log("📩 RevenueCat event received:", event);

      const userId = event.app_user_id;
      const productId = event.product_id || "";
      const eventType = event.type;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      // ----------------------------------------------------
      // 3️⃣ Determine subscription plan
      // ----------------------------------------------------
      let subscription = "free_trial";

      if (eventType === "INITIAL_PURCHASE" || eventType === "RENEWAL") {
        const pid = productId.toLowerCase();

        if (pid.includes("monthly")) subscription = "monthly";
        if (pid.includes("yearly")) subscription = "yearly";
      }

      // ----------------------------------------------------
      // 4️⃣ Update user subscription in DB
      // ----------------------------------------------------
      const updated_user = await User.findByIdAndUpdate(
        userId,
        { subscription_plan: subscription },
        { new: true }
      );

      console.log(`✅ Updated user ${userId} → ${subscription}`);

      // ----------------------------------------------------
      // 5️⃣ Send response
      // ----------------------------------------------------
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: {
          received: true,
          updated_user,
        },
      });

    } catch (error) {
      console.error("❌ Error in RevenueCat webhook:", error);
      return ResponseHandler.send(res, {
        statusCode: 500,
        status: "error",
        msgCode: 500,
        msg: getMessage(500, languageCode),
        data: null,
      });
    }
  }
}

export default new userController();
