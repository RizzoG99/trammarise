import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Webhook } from 'svix';
import { supabaseAdmin } from '../../src/lib/supabase/admin';

/**
 * Clerk webhook handler
 * Syncs user events (created/updated/deleted) to Supabase
 *
 * Webhook events:
 * - user.created: Create user in Supabase
 * - user.updated: Update user data
 * - user.deleted: Remove user from database
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ error: 'Webhook configuration error' });
  }

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).send('Webhook Error: Missing svix headers');
  }

  // Verify the webhook
  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(JSON.stringify(req.body), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    const error = err as Error;
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the webhook event
  const eventType = evt.type;
  const eventData = evt.data as {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string;
  };

  try {
    switch (eventType) {
      case 'user.created': {
        // Extract user data
        const email = eventData.email_addresses?.[0]?.email_address;
        if (!email) {
          return res.status(400).json({ error: 'Missing email address' });
        }

        const firstName = eventData.first_name;
        const lastName = eventData.last_name;
        const fullName =
          firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null;

        // Insert user into Supabase
        const { error } = await supabaseAdmin.from('users').insert({
          clerk_user_id: eventData.id,
          email,
          full_name: fullName,
          avatar_url: eventData.image_url,
        });

        if (error) {
          console.error('Failed to create user:', error);
          return res.status(500).json({ error: 'Failed to sync user' });
        }

        break;
      }

      case 'user.updated': {
        // Extract updated data
        const email = eventData.email_addresses?.[0]?.email_address;
        const firstName = eventData.first_name;
        const lastName = eventData.last_name;
        const fullName =
          firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null;

        // Update user in Supabase
        const { error } = await supabaseAdmin
          .from('users')
          .update({
            email,
            full_name: fullName,
            avatar_url: eventData.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', eventData.id);

        if (error) {
          console.error('Failed to update user:', error);
          return res.status(500).json({ error: 'Failed to sync user' });
        }

        break;
      }

      case 'user.deleted': {
        // Delete user from Supabase
        const { error } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('clerk_user_id', eventData.id);

        if (error) {
          console.error('Failed to delete user:', error);
          return res.status(500).json({ error: 'Failed to sync user' });
        }

        break;
      }

      default:
        // Unknown event type - log but don't fail
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Failed to sync user' });
  }
}
