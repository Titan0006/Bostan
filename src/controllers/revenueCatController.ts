import { Request, Response } from "express";
import { User, RevenueCatTransactionLog } from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import getMessage from "../i18n/index.js";

class userController {
  constructor() {
    this.webhook = this.webhook.bind(this);
  }

  // async webhook(req: Request, res: Response) {
  //   let languageCode = (req.headers["language"] as string) || "en";

  //   try {
  //     // Handle body parsing
  //     let raw = req.body;
  //     if (Buffer.isBuffer(raw)) raw = raw.toString("utf8");

  //     let body;
  //     try {
  //       body = JSON.parse(raw);
  //     } catch (err) {
  //       console.error("❌ Invalid JSON:", err);
  //       return res.status(400).json({ error: "Invalid JSON" });
  //     }

  //     const event = body.event || {};
  //     const appUserId = event.app_user_id;
  //     const eventType = event.type || "";
  //     const productId = (event.product_id || "").toLowerCase();
  //     const periodType = event.period_type; // paid, trial

  //     if (!appUserId) {
  //       return res.status(400).json({ error: "Missing app_user_id" });
  //     }

  //     let internalUser = await User.findById(appUserId);

  //     // 🔥 1) ALWAYS log the event
  //     let logEntry = await RevenueCatTransactionLog.create({
  //       user_id: internalUser?._id || null,
  //       rc_app_user_id: appUserId,

  //       event_type: eventType,
  //       product_id: event.product_id,

  //       original_transaction_id: event.original_transaction_id,
  //       transaction_id: event.transaction_id,
  //       entitlement_id: event.entitlement_id,

  //       store: event.store,
  //       period_type: event.period_type,

  //       purchased_at: event.purchased_at ? new Date(event.purchased_at) : null,
  //       expires_at: event.expires_at ? new Date(event.expires_at) : null,
  //       grace_period_expires_at: event.grace_period_expires_at
  //         ? new Date(event.grace_period_expires_at)
  //         : null,
  //       cancelled_at: event.cancelled_at ? new Date(event.cancelled_at) : null,

  //       price: event.price,
  //       currency: event.currency,

  //       raw_event: event,
  //       processed: false,
  //     });

  //     console.log("📝 RevenueCat log saved:", logEntry._id);

  //     // 🔥 2) Determine what to update in user doc
  //     let subscription_plan = null;
  //     let has_cancelled_subscription = false;
  //     let free_trial = periodType === "trial";
  //     let subscription_expiration = null;

  //     // TRIAL START
  //     if (eventType === "TRIAL_STARTED") {
  //       // free_trial = true;
  //       subscription_expiration = event.expires_at
  //         ? new Date(event.expires_at)
  //         : null;
  //     }

  //     // TRIAL → PAID
  //     // else if (eventType === "TRIAL_CONVERTED") {
  //     //   // free_trial = false;
  //     //   if (productId.includes("monthly")) subscription_plan = "monthly";
  //     //   if (productId.includes("yearly")) subscription_plan = "yearly";
  //     //   subscription_expiration = event.expires_at ? new Date(event.expires_at) : null;
  //     // }
  //     else if (eventType === "INITIAL_PURCHASE" || eventType === "RENEWAL") {
  //       if (productId.includes("monthly")) subscription_plan = "monthly";
  //       if (productId.includes("yearly")) subscription_plan = "yearly";

  //       subscription_expiration = event.expires_at
  //         ? new Date(event.expires_at)
  //         : null;

  //       // ⭐ Handle Trial → Paid Conversion
  //       if (eventType === "RENEWAL" && event.is_trial_conversion === true) {
  //         free_trial = false; // trial ended
  //         // subscription_plan already set above (monthly/yearly)
  //         // This marks the exact moment user becomes paying user
  //       }

  //       // If still in trial period on initial purchase
  //       if (eventType === "INITIAL_PURCHASE" && event.period_type === "trial") {
  //         free_trial = true;
  //       }
  //     }

  //     // CANCELLED (still active until expiration)
  //     else if (eventType === "CANCELLATION") {
  //       has_cancelled_subscription = true;
  //       // Do not force unsusbcribed yet, they may still have access
  //       subscription_expiration = event.expires_at
  //         ? new Date(event.expires_at)
  //         : null;
  //     }

  //     // SUB EXPIRED → REMOVE ACCESS
  //     else if (eventType === "EXPIRATION") {
  //       subscription_plan = "unsubscribed";
  //       // free_trial = false;
  //       has_cancelled_subscription = true;
  //     }

  //     // UN-CANCELLED (reactivated)
  //     else if (eventType === "UNCANCELLATION") {
  //       has_cancelled_subscription = false;
  //       if (productId.includes("monthly")) subscription_plan = "monthly";
  //       if (productId.includes("yearly")) subscription_plan = "yearly";
  //     }

  //     // PAYMENT FAILURE → unsubscribed
  //     else if (
  //       eventType === "PAYMENT_FAILURE" ||
  //       eventType === "BILLING_RETRY"
  //     ) {
  //       subscription_plan = "unsubscribed";
  //       // free_trial = false;
  //     }

  //     // 🔥 3) Update user if subscription_plan is determined
  //     let updated_user = null;

  //     try {
  //       if (subscription_plan !== null) {
  //         updated_user = await User.findByIdAndUpdate(
  //           appUserId,
  //           {
  //             subscription_plan,
  //             has_cancelled_subscription,
  //             subscription_expiration,
  //             free_trial,
  //           },
  //           { new: true }
  //         );
  //       }

  //       await RevenueCatTransactionLog.findByIdAndUpdate(logEntry._id, {
  //         processed: true,
  //       });
  //     } catch (err: any) {
  //       console.error("❌ Update Error:", err);

  //       await RevenueCatTransactionLog.findByIdAndUpdate(logEntry._id, {
  //         processed: false,
  //         processing_error: err.message,
  //       });
  //     }

  //     return ResponseHandler.send(res, {
  //       statusCode: 200,
  //       status: "success",
  //       msgCode: 1013,
  //       msg: getMessage(1013, languageCode),
  //       data: { received: true, event_type: eventType, updated_user, logEntry },
  //     });
  //   } catch (error) {
  //     console.error("❌ Webhook Error:", error);
  //     return ResponseHandler.send(res, {
  //       statusCode: 500,
  //       status: "error",
  //       msgCode: 500,
  //       msg: getMessage(500, languageCode),
  //       data: null,
  //     });
  //   }
  // }

  async webhook(req: Request, res: Response) {
    let languageCode = (req.headers["language"] as string) || "en";

    try {
      // -----------------------------
      // 1) Body Parsing
      // -----------------------------
      let raw = req.body;
      if (Buffer.isBuffer(raw)) raw = raw.toString("utf8");

      let body;
      try {
        body = JSON.parse(raw);
      } catch (err) {
        console.error("❌ Invalid JSON:", err);
        return res.status(400).json({ error: "Invalid JSON" });
      }

      const event = body.event || {};
      console.log('revenue cat event',event);
      const appUserId = event.app_user_id;
      const eventType = event.type || "";
      const productId = (event.product_id || "").toLowerCase();
      const periodType = event.period_type;

      if (!appUserId) {
        return res.status(400).json({ error: "Missing app_user_id" });
      }

      const internalUser = await User.findById(appUserId);

      // -----------------------------
      // 2) ALWAYS Log the Event
      // -----------------------------
      let logEntry = await RevenueCatTransactionLog.create({
        user_id: internalUser?._id || null,
        rc_app_user_id: appUserId,

        event_type: eventType,
        product_id: event.product_id,

        original_transaction_id: event.original_transaction_id,
        transaction_id: event.transaction_id,
        entitlement_id: event.entitlement_id,

        store: event.store,
        period_type: event.period_type,

        purchased_at: event.purchased_at ? new Date(event.purchased_at) : null,
        expires_at: event.expires_at ? new Date(event.expires_at) : null,
        grace_period_expires_at: event.grace_period_expires_at
          ? new Date(event.grace_period_expires_at)
          : null,
        cancelled_at: event.cancelled_at ? new Date(event.cancelled_at) : null,

        price: event.price,
        currency: event.currency,

        raw_event: event,
        processed: false,
      });

      console.log("📝 RevenueCat log saved:", logEntry._id);

      // -----------------------------
      // 3) Interpret Subscription State
      // -----------------------------
      let subscription_plan = internalUser?.subscription_plan;
      let has_cancelled_subscription = internalUser!.has_cancelled_subscription;
      let free_trial = periodType === "trial";
      let subscription_expiration = null;

      // ===========================================================
      // A) TRIAL STARTED
      // ===========================================================
      if (eventType === "TRIAL_STARTED") {
        free_trial = true;
        // subscription_expiration = event.expires_at
        //   ? new Date(event.expires_at)
        //   : null;
      }

      // ===========================================================
      // B) INITIAL PURCHASE / RENEWAL (paid)
      // ===========================================================
      else if (eventType === "INITIAL_PURCHASE" || eventType === "RENEWAL") {
        if (productId.includes("p1m") || productId.includes("monthly")) subscription_plan = "monthly";
        if (productId.includes("p1y") || productId.includes("monthly")) subscription_plan = "yearly";

        // subscription_expiration = event.expires_at
        //   ? new Date(event.expires_at)
        //   : null;

        // ⭐ Trial → Paid (THIS MATTERS!)
        if (event.is_trial_conversion === true) {
          console.log("🔥 TRIAL → PAID conversion detected");
          free_trial = false;
        }

        // Initial purchase but still in trial
        if (eventType === "INITIAL_PURCHASE" && (periodType === "trial" || periodType === "TRIAL")) {
          free_trial = true;
        }
      }

      // ===========================================================
      // C) CANCELLATION (User cancelled but still active)
      // ===========================================================
      else if (eventType === "CANCELLATION") {
        has_cancelled_subscription = true;
        // subscription_expiration = event.expires_at
        //   ? new Date(event.expires_at)
        //   : null;
      }

      // ===========================================================
      // D) EXPIRATION (Subscription ended)
      // ===========================================================
      else if (eventType === "EXPIRATION") {
        subscription_plan = "unsubscribed";
        has_cancelled_subscription = true;
        free_trial = false;
      }

      // ===========================================================
      // E) UN-CANCELLATION (User uncancelled)
      // ===========================================================
      else if (eventType === "UNCANCELLATION") {
        has_cancelled_subscription = false;
        if (productId.includes("p1m")) subscription_plan = "monthly";
        if (productId.includes("p1y")) subscription_plan = "yearly";
      }

      // ===========================================================
      // F) PAYMENT FAILURE / BILLING RETRY
      // ===========================================================
      else if (
        eventType === "PAYMENT_FAILURE" ||
        eventType === "BILLING_RETRY"
      ) {
        subscription_plan = "unsubscribed";
        free_trial = false;
      }

      // -----------------------------
      // 4) Update user doc
      // -----------------------------
      let updated_user = null;

      try {
        updated_user = await User.findByIdAndUpdate(
          appUserId,
          {
            subscription_plan,
            has_cancelled_subscription,
            free_trial,
          },
          { new: true }
        );

        await RevenueCatTransactionLog.findByIdAndUpdate(logEntry._id, {
          processed: true,
        });
      } catch (err: any) {
        console.error("❌ Update Error:", err);

        await RevenueCatTransactionLog.findByIdAndUpdate(logEntry._id, {
          processed: false,
          processing_error: err.message,
        });
      }

      // -----------------------------
      // 5) Send Response
      // -----------------------------
      return ResponseHandler.send(res, {
        statusCode: 200,
        status: "success",
        msgCode: 1013,
        msg: getMessage(1013, languageCode),
        data: { received: true, event_type: eventType, updated_user, logEntry },
      });
    } catch (error) {
      console.error("❌ Webhook Error:", error);

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
