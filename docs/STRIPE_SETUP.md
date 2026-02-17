# Stripe Integration Setup

## Prerequisites

1. **Create Stripe Account**
   - Sign up at https://dashboard.stripe.com/register
   - Complete account verification

2. **Create Products & Prices**

   Navigate to Products → Create Product:

   ### Free Tier
   - Name: "Trammarise Free"
   - Description: "BYOK (Bring Your Own Key) - No hosted API minutes"
   - Price: $0/month
   - Product ID: Store in `.env.local` as `STRIPE_PRICE_FREE`

   ### Pro Tier (Monthly)
   - Name: "Trammarise Pro (Monthly)"
   - Description: "500 minutes/month, all premium features"
   - Price: $19/month
   - Billing: Recurring monthly
   - Product ID: Store in `.env.local` as `STRIPE_PRICE_PRO_MONTHLY`

   ### Pro Tier (Annual)
   - Name: "Trammarise Pro (Annual)"
   - Description: "500 minutes/month, all premium features, 2 months free"
   - Price: $190/year ($15.83/month)
   - Billing: Recurring annually
   - Product ID: Store in `.env.local` as `STRIPE_PRICE_PRO_ANNUAL`

   ### Team Tier (Monthly)
   - Name: "Trammarise Team (Monthly)"
   - Description: "2000 minutes/month, team collaboration, priority support"
   - Price: $49/month
   - Billing: Recurring monthly
   - Product ID: Store in `.env.local` as `STRIPE_PRICE_TEAM_MONTHLY`

3. **Get API Keys**

   Navigate to Developers → API Keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
     - Add to `.env.local`: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

   - **Secret Key** (starts with `sk_test_` or `sk_live_`)
     - Add to `.env.local`: `STRIPE_SECRET_KEY=sk_test_...`

4. **Set Up Webhooks**

   Navigate to Developers → Webhooks → Add endpoint:
   - **Endpoint URL**: `https://your-domain.vercel.app/api/webhooks/stripe`
   - **Events to listen to**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed`

   - **Webhook Secret**: Copy and add to `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_...`

## Environment Variables

Add to `.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_FREE=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:5173  # Development
# NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app  # Production
```

## Testing

1. **Use Test Mode**
   - Always use test API keys during development (`sk_test_`, `pk_test_`)
   - Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)

2. **Test Webhooks Locally**

   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login to your account
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```

## Migration to Production

1. Switch to live API keys in production environment
2. Update webhook endpoint URL to production domain
3. Verify all products and prices are created in live mode
4. Test end-to-end flow with real card (refund immediately)

## Security Checklist

- ✅ Never commit API keys to repository
- ✅ Always verify webhook signatures
- ✅ Use environment variables for all secrets
- ✅ Enable Stripe Radar for fraud prevention
- ✅ Set up billing alerts in Stripe Dashboard
