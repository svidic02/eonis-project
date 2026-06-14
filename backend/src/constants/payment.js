import dotenv from "dotenv";
dotenv.config();

export const RSD_TO_USD = Number(process.env.RSD_TO_USD) || 0.0091;

export const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const PAYPAL_AMOUNT_TOLERANCE = 0.02;
