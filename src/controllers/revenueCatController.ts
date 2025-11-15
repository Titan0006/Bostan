import { Request, Response } from "express";
import { User } from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import getMessage from "../i18n/index.js";

class userController {
  constructor() {
    this.webhook = this.webhook.bind(this);
  }

  async webhook(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";

    try {
      // 1️⃣ Convert raw body buffer → JSON
      let raw = req.body;
      if (Buffer.isBuffer(raw)) raw = raw.toString("utf8");

      let body;
      try {
        body = JSON.parse(raw);
      } catch (err) {
        console.error("❌ Invalid JSON from RevenueCat:", err);
        return res.status(400).json({ error: "Invalid JSON" });
      }

      const event = body.event || {};
      console.log("📩 RevenueCat Event:", event);

      const userId = event.app_user_id;
      const eventType = event.type;
      const productId = (event.product_id || "").toLowerCase();

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      // 2️⃣ Determine subscription plan
      let subscription_plan = null;

      // -------- PURCHASE / RENEWAL --------
      if (eventType === "INITIAL_PURCHASE" || eventType === "RENEWAL") {
        if (productId.includes("monthly")) subscription_plan = "monthly";
        if (productId.includes("yearly")) subscription_plan = "yearly";
      }

      // -------- CANCELLATION --------
      else if (eventType === "CANCELLATION") {
        // Do NOT remove subscription immediately.
        // User keeps access until expiration.
        console.log("📌 User cancelled auto-renew");
        // No change in subscription_plan
      }

      // -------- EXPIRATION --------
      else if (eventType === "EXPIRATION") {
        subscription_plan = "unsubscribed";
      }

      // -------- UNCANCELLATION --------
      else if (eventType === "UNCANCELLATION") {
        if (productId.includes("monthly")) subscription_plan = "monthly";
        if (productId.includes("yearly")) subscription_plan = "yearly";
      }

      // If event should change plan → update DB
      let updated_user = null;
      if (subscription_plan !== null) {
        updated_user = await User.findByIdAndUpdate(
          userId,
          { subscription_plan },
          { new: true }
        );

        console.log(`✅ Updated user ${userId} → ${subscription_plan}`);
      } else {
        console.log("ℹ️ No subscription update required for event:", eventType);
      }

      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: {
          received: true,
          event_type: eventType,
          updated_user,
        },
      });

    } catch (error) {
      console.error("❌ RevenueCat Webhook Error:", error);
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
