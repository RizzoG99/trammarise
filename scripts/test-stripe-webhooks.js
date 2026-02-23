#!/usr/bin/env node

/**
 * Stripe Webhook Test Script
 *
 * This script tests Stripe webhook endpoints locally by simulating webhook events
 * with proper signature verification.
 *
 * Usage:
 *   node scripts/test-stripe-webhooks.js
 *   node scripts/test-stripe-webhooks.js subscription.created
 *   node scripts/test-stripe-webhooks.js --all
 *
 * Requirements:
 *   - Dev server running (npm run dev)
 *   - STRIPE_WEBHOOK_SECRET set in .env.local
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const WEBHOOK_ENDPOINT = '/api/webhooks/stripe';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Mock Stripe Events
const MOCK_EVENTS = {
  'subscription.created': {
    id: 'evt_test_subscription_created',
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_123',
        object: 'subscription',
        customer: 'cus_test_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 2592000, // +30 days
        cancel_at_period_end: false,
        items: {
          object: 'list',
          data: [
            {
              id: 'si_test_123',
              object: 'subscription_item',
              price: {
                id: 'price_pro_monthly',
                object: 'price',
                active: true,
                currency: 'usd',
                unit_amount: 1900,
                recurring: {
                  interval: 'month',
                },
              },
            },
          ],
        },
        metadata: {
          userId: 'user-test-123',
          clerkId: 'user_clerk_test_123',
          tier: 'pro',
        },
      },
    },
  },

  'subscription.updated': {
    id: 'evt_test_subscription_updated',
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_test_123',
        object: 'subscription',
        customer: 'cus_test_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 2592000,
        cancel_at_period_end: true, // User requested cancellation
        items: {
          object: 'list',
          data: [
            {
              id: 'si_test_123',
              object: 'subscription_item',
              price: {
                id: 'price_pro_monthly',
                object: 'price',
                active: true,
                currency: 'usd',
                unit_amount: 1900,
                recurring: {
                  interval: 'month',
                },
              },
            },
          ],
        },
        metadata: {
          userId: 'user-test-123',
          clerkId: 'user_clerk_test_123',
          tier: 'pro',
        },
      },
    },
  },

  'subscription.deleted': {
    id: 'evt_test_subscription_deleted',
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: 'sub_test_123',
        object: 'subscription',
        customer: 'cus_test_123',
        status: 'canceled',
        current_period_start: Math.floor(Date.now() / 1000) - 2592000,
        current_period_end: Math.floor(Date.now() / 1000),
        cancel_at_period_end: false,
        items: {
          object: 'list',
          data: [
            {
              id: 'si_test_123',
              object: 'subscription_item',
              price: {
                id: 'price_pro_monthly',
                object: 'price',
              },
            },
          ],
        },
      },
    },
  },

  'checkout.completed': {
    id: 'evt_test_checkout_completed',
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        customer: 'cus_test_123',
        mode: 'subscription',
        payment_status: 'paid',
        status: 'complete',
        subscription: 'sub_test_123',
        metadata: {
          userId: 'user-test-123',
          tier: 'pro',
          interval: 'month',
        },
      },
    },
  },
};

/**
 * Generate Stripe webhook signature
 */
function generateStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return `t=${timestamp},v1=${signature}`;
}

/**
 * Send webhook event to local server
 */
function sendWebhook(eventType, event) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const url = new URL(API_URL + WEBHOOK_ENDPOINT);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'stripe-signature': signature,
      },
    };

    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Testing: ${eventType}`, 'bright');
    log(`Event Type: ${event.type}`, 'blue');
    log(`Event ID: ${event.id}`, 'blue');
    log(`Endpoint: ${API_URL}${WEBHOOK_ENDPOINT}`, 'blue');
    log(`${'='.repeat(60)}`, 'cyan');

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const success = res.statusCode === 200;

        if (success) {
          log(`✓ SUCCESS: ${res.statusCode} ${res.statusMessage}`, 'green');
          try {
            const response = JSON.parse(data);
            log(`  Response: ${JSON.stringify(response)}`, 'green');
          } catch {
            log(`  Response: ${data}`, 'green');
          }
          resolve({ success: true, statusCode: res.statusCode, data });
        } else {
          log(`✗ FAILED: ${res.statusCode} ${res.statusMessage}`, 'red');
          log(`  Response: ${data}`, 'red');
          resolve({ success: false, statusCode: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      log(`✗ ERROR: ${error.message}`, 'red');
      log(`  Make sure your dev server is running (npm run dev)`, 'yellow');
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Run all tests
 */
async function runAllTests() {
  log('\n🧪 Stripe Webhook Test Suite', 'bright');
  log(`Target: ${API_URL}${WEBHOOK_ENDPOINT}\n`, 'cyan');

  const results = [];

  for (const [eventType, event] of Object.entries(MOCK_EVENTS)) {
    try {
      const result = await sendWebhook(eventType, event);
      results.push({ eventType, ...result });
      await new Promise((resolve) => setTimeout(resolve, 500)); // Brief pause between tests
    } catch (error) {
      results.push({ eventType, success: false, error: error.message });
      break; // Stop on first connection error
    }
  }

  // Summary
  log(`\n${'='.repeat(60)}`, 'cyan');
  log('TEST SUMMARY', 'bright');
  log(`${'='.repeat(60)}`, 'cyan');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach(({ eventType, success, statusCode, error }) => {
    const status = success ? '✓ PASS' : '✗ FAIL';
    const color = success ? 'green' : 'red';
    const code = statusCode ? ` (${statusCode})` : '';
    const errorMsg = error ? ` - ${error}` : '';
    log(`${status}: ${eventType}${code}${errorMsg}`, color);
  });

  log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`, 'cyan');

  if (failed === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log(`\n⚠️  ${failed} test(s) failed`, 'red');
    process.exit(1);
  }
}

/**
 * Run single test
 */
async function runSingleTest(eventType) {
  const event = MOCK_EVENTS[eventType];

  if (!event) {
    log(`\n✗ Unknown event type: ${eventType}`, 'red');
    log(`\nAvailable events:`, 'yellow');
    Object.keys(MOCK_EVENTS).forEach((key) => {
      log(`  - ${key}`, 'cyan');
    });
    process.exit(1);
  }

  try {
    const result = await sendWebhook(eventType, event);
    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    log(`\n✗ Connection failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Display help
 */
function showHelp() {
  log('\n📚 Stripe Webhook Test Script', 'bright');
  log('\nUsage:', 'cyan');
  log('  node scripts/test-stripe-webhooks.js                    # Run all tests');
  log('  node scripts/test-stripe-webhooks.js subscription.created  # Run single test');
  log('  node scripts/test-stripe-webhooks.js --all              # Run all tests');
  log('  node scripts/test-stripe-webhooks.js --help             # Show this help');

  log('\nAvailable Events:', 'cyan');
  Object.keys(MOCK_EVENTS).forEach((key) => {
    log(`  - ${key}`, 'blue');
  });

  log('\nEnvironment Variables:', 'cyan');
  log('  API_URL              - API server URL (default: http://localhost:3001)');
  log('  STRIPE_WEBHOOK_SECRET - Webhook signing secret from stripe listen');

  log('\nExamples:', 'cyan');
  log('  # Test subscription created event');
  log('  node scripts/test-stripe-webhooks.js subscription.created', 'blue');
  log('\n  # Test all events');
  log('  node scripts/test-stripe-webhooks.js --all', 'blue');
  log('\n  # Test against custom API URL');
  log('  API_URL=https://api.example.com node scripts/test-stripe-webhooks.js', 'blue');
  log('');
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--all') {
  runAllTests().catch((error) => {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
} else if (command === '--help' || command === '-h') {
  showHelp();
} else {
  runSingleTest(command).catch((error) => {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}
