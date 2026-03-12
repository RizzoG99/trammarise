"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/stripe/create-checkout-session.ts
var create_checkout_session_exports = {};
__export(create_checkout_session_exports, {
  default: () => handler
});
module.exports = __toCommonJS(create_checkout_session_exports);
var import_stripe = __toESM(require("stripe"));

// api/_lib/supabase-admin.ts
var import_supabase_js = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase admin credentials not found. Server-side operations will fail.");
}
var supabaseAdmin = (0, import_supabase_js.createClient)(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// api/_middleware/auth.ts
var AuthError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
};
async function requireAuth(req) {
  const authHeader = req.headers["authorization"];
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const token = raw?.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) {
    throw new AuthError("Missing authorization token", 401);
  }
  const {
    data: { user },
    error
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new AuthError("Invalid or expired token", 401);
  }
  return { userId: user.id };
}

// api/stripe/create-checkout-session.ts
var stripe = null;
function getStripeClient() {
  if (!stripe) {
    stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-01-28.clover"
    });
  }
  return stripe;
}
var PRICE_IDS = {
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    year: process.env.STRIPE_PRICE_PRO_ANNUAL || ""
  }
};
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { userId } = await requireAuth(req);
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id, email").eq("id", userId).single();
    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { tier, interval } = req.body;
    if (!tier || !interval || !PRICE_IDS[tier]?.[interval]) {
      return res.status(400).json({ error: "Invalid tier or interval" });
    }
    const priceId = PRICE_IDS[tier][interval];
    if (!priceId) {
      return res.status(500).json({ error: "Price ID not configured" });
    }
    const stripeClient = getStripeClient();
    const session = await stripeClient.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173"}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173"}/pricing`,
      metadata: {
        userId,
        tier,
        interval
      }
    });
    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes("Stripe")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
