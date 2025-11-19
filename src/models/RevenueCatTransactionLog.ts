import { Schema, model } from "mongoose";
import { IRevenueCatTransactionLog } from "./interfaces/index.js";

const revenueCatTransactionLogSchema = new Schema<IRevenueCatTransactionLog>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },

    rc_app_user_id: { type: String, required: false },

    event_type: { type: String, required: false },
    product_id: { type: String, required: false },

    original_transaction_id: { type: String, required: false },
    transaction_id: { type: String, required: false },
    entitlement_id: { type: String, required: false },

    store: { type: String, required: false },
    period_type: { type: String, required: false },

    purchased_at: { type: Date, required: false },
    expires_at: { type: Date, required: false },
    grace_period_expires_at: { type: Date, required: false },
    cancelled_at: { type: Date, required: false },

    price: { type: Number, required: false },
    currency: { type: String, required: false },

    raw_event: { type: Object, required: false },

    processed: { type: Boolean, default: false },
    processing_error: { type: String, default: null },
  },
  { timestamps: true }
);

const RevenueCatTransactionLog = model<IRevenueCatTransactionLog>(
  "RevenueCatTransactionLog",
  revenueCatTransactionLogSchema,
  "RevenueCatTransactionLog"
);

export default RevenueCatTransactionLog;
