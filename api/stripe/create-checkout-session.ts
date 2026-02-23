import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, AuthError } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

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

// Price ID mapping for tiers and intervals
const PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    year: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
  },
  team: {
    month: process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
    year: process.env.STRIPE_PRICE_TEAM_ANNUAL || '',
  },
};

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe Checkout session for subscription purchase
 *
 * @param req.body.tier - Subscription tier ('pro' or 'team')
 * @param req.body.interval - Billing interval ('month' or 'year')
 * @returns 200 with { sessionId, url }
 * @returns 400 for invalid tier/interval
 * @returns 401 for unauthenticated requests
 * @returns 404 if user not found
 * @returns 405 for non-POST requests
 * @returns 500 for server errors
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const { userId, clerkId } = await requireAuth(req);

    // Get user email from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate request body
    const { tier, interval } = req.body;

    // Validate tier and interval
    if (!tier || !interval || !PRICE_IDS[tier]?.[interval]) {
      return res.status(400).json({ error: 'Invalid tier or interval' });
    }

    const priceId = PRICE_IDS[tier][interval];

    if (!priceId) {
      return res.status(500).json({ error: 'Price ID not configured' });
    }

    // Create Stripe Checkout session
    const stripeClient = getStripeClient();
    const session = await stripeClient.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/pricing`,
      metadata: {
        userId,
        clerkId,
        tier,
        interval,
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);

    // Handle authentication errors
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    // Handle Stripe API errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
