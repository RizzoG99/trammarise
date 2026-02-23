# Trammarise Scripts

Utility scripts for development, testing, and deployment.

## Available Scripts

### Stripe Webhook Testing

**`test-stripe-webhooks.js`** - Test Stripe webhook integration locally

Tests your Stripe webhook endpoint by simulating real webhook events with proper signature verification.

#### Usage

```bash
# Run all webhook tests
npm run test:stripe
# or
node scripts/test-stripe-webhooks.js

# Run specific event test
npm run test:stripe subscription.created
# or
node scripts/test-stripe-webhooks.js subscription.created

# Show help
node scripts/test-stripe-webhooks.js --help
```

#### Available Events

- `subscription.created` - Test subscription creation
- `subscription.updated` - Test subscription update (e.g., cancellation)
- `subscription.deleted` - Test subscription deletion
- `checkout.completed` - Test checkout completion

#### Environment Variables

- `API_URL` - API server URL (default: `http://localhost:3001`)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret from `stripe listen`

#### Examples

```bash
# Test all events
npm run test:stripe:all

# Test single event
npm run test:stripe subscription.created

# Test against custom API URL
API_URL=https://staging.example.com npm run test:stripe

# Use custom webhook secret
STRIPE_WEBHOOK_SECRET=whsec_custom npm run test:stripe
```

#### Prerequisites

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Get webhook secret** from Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   # Copy the webhook secret from output
   ```

3. **Add to `.env.local`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

#### Output

```
🧪 Stripe Webhook Test Suite
Target: http://localhost:3001/api/webhooks/stripe

============================================================
Testing: subscription.created
Event Type: customer.subscription.created
Event ID: evt_test_subscription_created
Endpoint: http://localhost:3001/api/webhooks/stripe
============================================================
✓ SUCCESS: 200 OK
  Response: {"received":true}

============================================================
TEST SUMMARY
============================================================
✓ PASS: subscription.created (200)
✓ PASS: subscription.updated (200)
✓ PASS: subscription.deleted (200)
✓ PASS: checkout.completed (200)

Total: 4 | Passed: 4 | Failed: 0

🎉 All tests passed!
```

---

### Other Scripts

**`generate-sitemap.js`** - Generate sitemap.xml for SEO

```bash
npm run build:sitemap
```

**`setup-ffmpeg.sh`** - Install FFmpeg dependencies

```bash
npm run setup:ffmpeg
```

---

## Development Workflow

### Testing Stripe Integration

1. **Terminal 1** - Start dev server:

   ```bash
   npm run dev
   ```

2. **Terminal 2** - Start Stripe webhook listener:

   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```

3. **Terminal 3** - Run webhook tests:
   ```bash
   npm run test:stripe:all
   ```

### Complete Test Suite

```bash
# Frontend tests
npm test

# API tests
npm run api-test

# Stripe webhook tests
npm run test:stripe:all

# All tests (run separately)
npm test && npm run api-test && npm run test:stripe:all
```

---

## Troubleshooting

### Webhook Tests Failing

**Error: Connection refused**

- Ensure dev server is running (`npm run dev`)
- Check API port (should be 3001)

**Error: Invalid signature**

- Verify `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Get fresh secret from `stripe listen` output
- Restart dev server after changing env vars

**Error: Unknown event type**

- Check available events: `node scripts/test-stripe-webhooks.js --help`
- Event names are case-sensitive

### General Issues

**Command not found**

- Ensure you're in the project root directory
- Check that `scripts/` folder exists
- Verify script has execute permissions: `chmod +x scripts/test-stripe-webhooks.js`

---

## Contributing

When adding new scripts:

1. Place in `scripts/` folder
2. Add npm script alias in `package.json`
3. Document in this README
4. Make executable: `chmod +x scripts/your-script.js`
5. Add shebang: `#!/usr/bin/env node`
6. Include help text: `--help` flag
