import { Types } from "mongoose";

export interface IRevenueCatTransactionLog {
  _id: Types.ObjectId;

  user_id?: Types.ObjectId; // Internal user reference (optional)
  rc_app_user_id: string; // RevenueCat app_user_id

  event_type: string; // INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
  product_id?: string; // monthly/yearly SKU

  original_transaction_id?: string; // RC / Store transaction IDs
  transaction_id?: string;
  entitlement_id?: string;

  store?: string; // app_store, play_store, stripe, etc.
  period_type?: string; // trial, intro, normal

  purchased_at?: Date; // Start of subscription
  expires_at?: Date; // When access ends
  grace_period_expires_at?: Date; // Optional, for billing retry grace period
  cancelled_at?: Date; // When auto-renew was disabled

  price?: number; // Price that user paid
  currency?: string; // INR, USD, etc.

  raw_event: any; // Entire RevenueCat payload (for debugging)

  processed: boolean; // Whether your webhook logic processed it
  processing_error?: string | null; // Store error (if any)

  createdAt?: Date;
  updatedAt?: Date;
}
