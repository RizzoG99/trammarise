/**
 * Stripe Test Fixtures
 *
 * Reusable mock data for Stripe objects used across test files.
 * These fixtures provide consistent, type-safe mock data for testing
 * Stripe webhooks, payment intents, subscriptions, and checkout sessions.
 */

import type Stripe from 'stripe';

/**
 * Mock Stripe Subscription
 *
 * @param overrides - Partial subscription data to override defaults
 * @returns A complete mock Stripe subscription object
 */
export function mockStripeSubscription(
  overrides: Partial<Stripe.Subscription> = {}
): Stripe.Subscription {
  const now = Math.floor(Date.now() / 1000);

  return {
    id: overrides.id || 'sub_test_123',
    object: 'subscription',
    customer: overrides.customer || 'cus_test_123',
    status: overrides.status || 'active',
    current_period_start: ('current_period_start' in overrides
      ? overrides.current_period_start
      : now) as number,
    current_period_end: ('current_period_end' in overrides
      ? overrides.current_period_end
      : now + 2592000) as number,
    cancel_at_period_end: overrides.cancel_at_period_end ?? false,
    created: overrides.created || now,
    canceled_at: overrides.canceled_at || null,
    ended_at: overrides.ended_at || null,
    items: overrides.items || {
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
            product: 'prod_test_123',
            type: 'recurring',
            unit_amount: 1900,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          } as Stripe.Price,
          subscription: 'sub_test_123',
          quantity: 1,
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: '/v1/subscription_items',
    },
    metadata: overrides.metadata || {
      userId: 'user-uuid-123',
      tier: 'pro',
    },
    // Required fields with reasonable defaults
    application: null,
    application_fee_percent: null,
    automatic_tax: { enabled: false },
    billing_cycle_anchor: ('billing_cycle_anchor' in overrides
      ? overrides.billing_cycle_anchor
      : now) as number,
    billing_thresholds: null,
    cancel_at: null,
    cancellation_details: null,
    collection_method: 'charge_automatically',
    currency: 'usd',
    days_until_due: null,
    default_payment_method: null,
    default_source: null,
    default_tax_rates: [],
    description: null,
    discount: null,
    invoice_settings: {
      account_tax_ids: null,
      issuer: { type: 'self' },
    },
    latest_invoice: null,
    livemode: false,
    next_pending_invoice_item_invoice: null,
    on_behalf_of: null,
    pause_collection: null,
    payment_settings: null,
    pending_invoice_item_interval: null,
    pending_setup_intent: null,
    pending_update: null,
    schedule: null,
    start_date: now,
    test_clock: null,
    transfer_data: null,
    trial_end: null,
    trial_settings: null,
    trial_start: null,
    ...overrides,
  } as Stripe.Subscription;
}

/**
 * Mock Stripe Payment Intent
 *
 * @param overrides - Partial payment intent data to override defaults
 * @returns A complete mock Stripe payment intent object
 */
export function mockStripePaymentIntent(
  overrides: Partial<Stripe.PaymentIntent> = {}
): Stripe.PaymentIntent {
  const now = Math.floor(Date.now() / 1000);

  return {
    id: overrides.id || 'pi_test_123',
    object: 'payment_intent',
    amount: overrides.amount || 500, // $5.00 in cents
    currency: overrides.currency || 'usd',
    status: overrides.status || 'requires_payment_method',
    client_secret: overrides.client_secret || 'pi_test_123_secret_456',
    created: overrides.created || now,
    customer: overrides.customer || 'cus_test_123',
    description: overrides.description || null,
    metadata: overrides.metadata || {
      userId: 'user-uuid-123',
      credits: '50',
    },
    // Required fields
    amount_capturable: 0,
    amount_details: {},
    amount_received: 0,
    application: null,
    application_fee_amount: null,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: 'automatic',
    confirmation_method: 'automatic',
    livemode: false,
    next_action: null,
    on_behalf_of: null,
    payment_method: null,
    payment_method_configuration_details: null,
    payment_method_options: {},
    payment_method_types: ['card'],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    transfer_data: null,
    transfer_group: null,
    ...overrides,
  } as Stripe.PaymentIntent;
}

/**
 * Mock Stripe Checkout Session
 *
 * @param overrides - Partial checkout session data to override defaults
 * @returns A complete mock Stripe checkout session object
 */
export function mockStripeCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {}
): Stripe.Checkout.Session {
  const now = Math.floor(Date.now() / 1000);

  return {
    id: overrides.id || 'cs_test_123',
    object: 'checkout.session',
    customer: overrides.customer || 'cus_test_123',
    mode: overrides.mode || 'subscription',
    status: overrides.status || 'open',
    url: overrides.url || 'https://checkout.stripe.com/pay/cs_test_123',
    success_url: overrides.success_url || 'https://example.com/success',
    cancel_url: overrides.cancel_url || 'https://example.com/cancel',
    payment_status: overrides.payment_status || 'unpaid',
    created: overrides.created || now,
    expires_at: overrides.expires_at || now + 1800, // +30 minutes
    metadata: overrides.metadata || {
      userId: 'user-uuid-123',
      tier: 'pro',
    },
    // Required fields
    after_expiration: null,
    allow_promotion_codes: null,
    amount_subtotal: null,
    amount_total: null,
    automatic_tax: { enabled: false, liability: null, status: null },
    billing_address_collection: null,
    client_reference_id: null,
    client_secret: null,
    consent: null,
    consent_collection: null,
    currency: null,
    currency_conversion: null,
    custom_fields: [],
    custom_text: {},
    customer_creation: null,
    customer_details: null,
    customer_email: null,
    invoice: null,
    invoice_creation: null,
    line_items: undefined,
    livemode: false,
    locale: null,
    payment_intent: null,
    payment_link: null,
    payment_method_collection: null,
    payment_method_configuration_details: null,
    payment_method_options: null,
    payment_method_types: ['card'],
    phone_number_collection: null,
    recovered_from: null,
    redirect_on_completion: null,
    return_url: null,
    saved_payment_method_options: null,
    setup_intent: null,
    shipping_address_collection: null,
    shipping_cost: null,
    shipping_details: null,
    shipping_options: [],
    submit_type: null,
    subscription: null,
    tax_id_collection: null,
    total_details: null,
    ui_mode: 'hosted',
    ...overrides,
  } as Stripe.Checkout.Session;
}

/**
 * Mock Stripe Customer
 *
 * @param overrides - Partial customer data to override defaults
 * @returns A complete mock Stripe customer object
 */
export function mockStripeCustomer(overrides: Partial<Stripe.Customer> = {}): Stripe.Customer {
  const now = Math.floor(Date.now() / 1000);

  return {
    id: overrides.id || 'cus_test_123',
    object: 'customer',
    email: overrides.email || 'test@example.com',
    name: overrides.name || 'Test User',
    created: overrides.created || now,
    metadata: overrides.metadata || {
      clerkUserId: 'user_test_123',
    },
    // Required fields
    address: null,
    balance: 0,
    cash_balance: null,
    currency: null,
    default_source: null,
    delinquent: false,
    description: null,
    discount: null,
    invoice_prefix: null,
    invoice_settings: {
      custom_fields: null,
      default_payment_method: null,
      footer: null,
      rendering_options: null,
    },
    livemode: false,
    next_invoice_sequence: 1,
    phone: null,
    preferred_locales: [],
    shipping: null,
    tax_exempt: 'none',
    test_clock: null,
    ...overrides,
  } as Stripe.Customer;
}

/**
 * Mock Stripe Webhook Event
 *
 * @param type - Event type (e.g., 'customer.subscription.created')
 * @param data - Event data object
 * @returns A complete mock Stripe event object
 */
export function mockStripeWebhookEvent<T = unknown>(type: string, data: T): Stripe.Event {
  const now = Math.floor(Date.now() / 1000);

  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2024-11-20.acacia',
    created: now,
    data: {
      object: data as Stripe.Event.Data['object'],
      previous_attributes: undefined,
    },
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: `req_test_${Date.now()}`,
      idempotency_key: null,
    },
    type,
  } as Stripe.Event;
}
