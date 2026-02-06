import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * Credit Purchase Endpoint
 *
 * Creates a Stripe Payment Intent for purchasing transcription credits.
 * Credits are added to the user's balance after successful payment.
 *
 * Pricing Tiers:
 * - 50 credits ($5.00) - $0.10/credit
 * - 175 credits ($15.00) - $0.086/credit (15% discount)
 * - 400 credits ($30.00) - $0.075/credit (25% discount)
 * - 750 credits ($50.00) - $0.067/credit (33% discount)
 */

// Lazy Stripe initialization for testability
let stripe: Stripe | null = null;
function getStripeClient(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripe;
}

// Credit tiers with pricing
const CREDIT_TIERS: Record<number, number> = {
  50: 500, // $5.00
  175: 1500, // $15.00
  400: 3000, // $30.00
  750: 5000, // $50.00
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, clerkId } = await requireAuth();
    const { credits } = req.body;

    // Validate credit amount
    if (!CREDIT_TIERS[credits]) {
      return res.status(400).json({
        error: `Invalid credit amount. Choose from: ${Object.keys(CREDIT_TIERS).join(', ')}`,
      });
    }

    const amount = CREDIT_TIERS[credits];

    // Fetch user email for Stripe metadata
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe Payment Intent
    const stripeClient = getStripeClient();
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId,
        clerkId,
        credits: String(credits),
        type: 'credit_purchase',
      },
      description: `Purchase ${credits} minutes of transcription credits`,
    });

    return res.status(200).json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      credits,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Failed to create payment intent' });
  }
}
