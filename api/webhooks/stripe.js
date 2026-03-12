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

// api/webhooks/stripe.ts
var stripe_exports = {};
__export(stripe_exports, {
  config: () => config,
  default: () => handler
});
module.exports = __toCommonJS(stripe_exports);
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

// api/webhooks/stripe.ts
var config = {
  api: {
    bodyParser: false
  }
};
var stripe = null;
function getStripeClient() {
  if (!stripe) {
    stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-01-28.clover"
    });
  }
  return stripe;
}
var PRICE_TO_TIER = {};
if (process.env.STRIPE_PRICE_PRO_MONTHLY)
  PRICE_TO_TIER[process.env.STRIPE_PRICE_PRO_MONTHLY] = "pro";
if (process.env.STRIPE_PRICE_PRO_ANNUAL) PRICE_TO_TIER[process.env.STRIPE_PRICE_PRO_ANNUAL] = "pro";
if (process.env.STRIPE_PRICE_TEAM_MONTHLY)
  PRICE_TO_TIER[process.env.STRIPE_PRICE_TEAM_MONTHLY] = "team";
if (process.env.STRIPE_PRICE_TEAM_ANNUAL)
  PRICE_TO_TIER[process.env.STRIPE_PRICE_TEAM_ANNUAL] = "team";
function determineTier(priceId) {
  if (!priceId) return "free";
  const tier = PRICE_TO_TIER[priceId];
  if (!tier) {
    console.warn(
      `[determineTier] unrecognised price ID "${priceId}" \u2014 defaulting to free. Check STRIPE_PRICE_* env vars.`
    );
    return "free";
  }
  return tier;
}
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CRITICAL: STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook configuration error" });
  }
  if (!sig) {
    return res.status(400).send("Missing stripe-signature header");
  }
  const rawBody = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
  let event;
  try {
    const stripeClient = getStripeClient();
    event = stripeClient.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const error = err;
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const tier = subscription.metadata?.tier || determineTier(priceId);
        const userId = subscription.metadata?.userId;
        if (!userId) {
          console.error("No userId in subscription metadata");
          break;
        }
        const { error } = await supabaseAdmin.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          tier,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1e3).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1e3).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (error) {
          console.error("Failed to upsert subscription:", error);
          return res.status(500).send("Webhook handler failed");
        }
        console.log(`Subscription ${subscription.id} ${event.type}`);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const { error } = await supabaseAdmin.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", subscription.id);
        if (error) {
          console.error("Failed to update subscription:", error);
          return res.status(500).send("Webhook handler failed");
        }
        console.log(`Subscription ${subscription.id} deleted`);
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata.type === "credit_purchase") {
          const userId = paymentIntent.metadata.userId;
          const credits = parseInt(paymentIntent.metadata.credits || "0", 10);
          if (!userId || !credits) {
            console.error("Missing userId or credits in payment intent metadata");
            return res.status(500).send("Missing required payment metadata");
          }
          const { data: subscription, error: subError } = await supabaseAdmin.from("subscriptions").select("id, credits_balance").eq("user_id", userId).single();
          if (subError) {
            console.error("Failed to fetch subscription for credit purchase:", subError);
            return res.status(500).send("Webhook handler failed");
          }
          const { error: rpcError } = await supabaseAdmin.rpc("add_credits", {
            sub_id: subscription.id,
            credits,
            stripe_payment_intent_id: paymentIntent.id,
            amount_paid_cents: paymentIntent.amount,
            p_description: `Purchased ${credits} credits for $${(paymentIntent.amount / 100).toFixed(2)}`
          });
          if (rpcError) {
            console.error("Failed to add credits:", rpcError);
            return res.status(500).send("Webhook handler failed");
          }
          console.log(`Added ${credits} credits to user ${userId} via payment ${paymentIntent.id}`);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).send("Webhook handler failed");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  config
});
