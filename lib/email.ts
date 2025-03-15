/**
 * Re-export email functions from app/lib/email.ts
 * This file exists to provide compatibility with imports using @/lib/email
 */

export {
  sendOrderConfirmation,
  sendOrderNotification,
  sendShippingNotification,
  sendCreditInfo
} from "../app/lib/email";
