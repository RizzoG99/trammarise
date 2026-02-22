import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { supabaseAdmin } from '../lib/supabase-admin';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Lazy initialization of Stripe
let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-01-28.clover',
    });
  }
  return stripe;
}

// Map price IDs to tiers (only populate when env vars are set to avoid empty-string key collisions)
const PRICE_TO_TIER: Record<string, string> = {};
if (process.env.STRIPE_PRICE_PRO_MONTHLY)
  PRICE_TO_TIER[process.env.STRIPE_PRICE_PRO_MONTHLY] = 'pro';
if (process.env.STRIPE_PRICE_PRO_ANNUAL) PRICE_TO_TIER[process.env.STRIPE_PRICE_PRO_ANNUAL] = 'pro';
if (process.env.STRIPE_PRICE_TEAM_MONTHLY)
  PRICE_TO_TIER[process.env.STRIPE_PRICE_TEAM_MONTHLY] = 'team';
if (process.env.STRIPE_PRICE_TEAM_ANNUAL)
  PRICE_TO_TIER[process.env.STRIPE_PRICE_TEAM_ANNUAL] = 'team';

/**
 * Determine subscription tier from Stripe price ID
 */
function determineTier(priceId: string | undefined): string {
  if (!priceId) return 'free';
  return PRICE_TO_TIER[priceId] || 'free';
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for subscription management and credit purchases
 *
 * Events handled:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - payment_intent.succeeded (for credit purchases)
 *
 * @returns 200 with { received: true }
 * @returns 400 for invalid signature
 * @returns 405 for non-POST requests
 * @returns 500 for server errors
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CRITICAL: STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook configuration error' });
  }

  if (!sig) {
    return res.status(400).send('Missing stripe-signature header');
  }

  // Accumulate raw body for signature verification (bodyParser is disabled)
  const rawBody = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  let event: Stripe.Event;

  try {
    // Verify webhook signature using raw buffer (required by Stripe)
    const stripeClient = getStripeClient();
    event = stripeClient.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Extract tier from price ID
        const priceId = subscription.items.data[0]?.price.id;
        const tier = subscription.metadata.tier || determineTier(priceId);
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Upsert subscription in database
        const { error } = await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          tier,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Failed to upsert subscription:', error);
          return res.status(500).send('Webhook handler failed');
        }

        console.log(`Subscription ${subscription.id} ${event.type}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status to canceled
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Failed to update subscription:', error);
          return res.status(500).send('Webhook handler failed');
        }

        console.log(`Subscription ${subscription.id} deleted`);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Check if this is a credit purchase
        if (paymentIntent.metadata.type === 'credit_purchase') {
          const userId = paymentIntent.metadata.userId;
          const credits = parseInt(paymentIntent.metadata.credits || '0', 10);

          if (!userId || !credits) {
            console.error('Missing userId or credits in payment intent metadata');
            return res.status(500).send('Missing required payment metadata');
          }

          // Fetch user's subscription
          const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('id, credits_balance')
            .eq('user_id', userId)
            .single();

          if (subError) {
            console.error('Failed to fetch subscription for credit purchase:', subError);
            return res.status(500).send('Webhook handler failed');
          }

          // Add credits to balance (RPC handles transaction record atomically)
          const { error: rpcError } = await supabaseAdmin.rpc('add_credits', {
            sub_id: subscription.id,
            credits,
            stripe_payment_intent_id: paymentIntent.id,
            amount_paid_cents: paymentIntent.amount,
            p_description: `Purchased ${credits} credits for $${(paymentIntent.amount / 100).toFixed(2)}`,
          });

          if (rpcError) {
            console.error('Failed to add credits:', rpcError);
            return res.status(500).send('Webhook handler failed');
          }

          console.log(`Added ${credits} credits to user ${userId} via payment ${paymentIntent.id}`);
        }
        break;
      }

      default:
        // Unhandled event type - just acknowledge receipt
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).send('Webhook handler failed');
  }
}
