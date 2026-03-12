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

// api/credits/purchase.ts
var purchase_exports = {};
__export(purchase_exports, {
  default: () => handler
});
module.exports = __toCommonJS(purchase_exports);
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

// api/credits/purchase.ts
var stripe = null;
function getStripeClient() {
  if (!stripe) {
    stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-01-28.clover"
    });
  }
  return stripe;
}
var CREDIT_TIERS = {
  50: 500,
  // $5.00
  175: 1500,
  // $15.00
  400: 3e3,
  // $30.00
  750: 5e3
  // $50.00
};
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { userId } = await requireAuth(req);
    const { credits } = req.body;
    if (!CREDIT_TIERS[credits]) {
      return res.status(400).json({
        error: `Invalid credit amount. Choose from: ${Object.keys(CREDIT_TIERS).join(", ")}`
      });
    }
    const amount = CREDIT_TIERS[credits];
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("email").eq("id", userId).single();
    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }
    const stripeClient = getStripeClient();
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        userId,
        credits: String(credits),
        type: "credit_purchase"
      },
      description: `Purchase ${credits} minutes of transcription credits`
    });
    return res.status(200).json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      credits
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    if (error instanceof Error && error.name === "AuthError") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
}
