import type { VercelRequest } from '@vercel/node';
import { createClerkClient } from '@clerk/backend';
import { supabaseAdmin } from '../lib/supabase-admin';

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthResult {
  userId: string;
  clerkId: string;
}

/**
 * Converts a VercelRequest (Node.js IncomingMessage) to a web standard Request object
 * Required for Clerk's authenticateRequest which expects a full URL
 */
function toWebRequest(req: VercelRequest): Request {
  // Construct full URL from request
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3001';
  const url = `${protocol}://${host}${req.url}`;

  // Create web standard Request with headers
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  return new Request(url, {
    method: req.method,
    headers,
  });
}

/**
 * Middleware to require authentication for API routes
 * Validates JWT from Clerk and fetches user from Supabase
 *
 * @param req - Vercel request object containing headers/cookies
 * @returns User ID (internal UUID) and Clerk user ID
 * @throws AuthError if authentication fails
 *
 * @example
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   const { userId } = await requireAuth(req);
 *   // ... proceed with authenticated logic
 * }
 */
export async function requireAuth(req: VercelRequest): Promise<AuthResult> {
  // Create Clerk client with both secret and publishable keys
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  });

  try {
    // Use authenticateRequest for both dev and production
    // This properly handles Clerk session tokens in all environments
    // Convert VercelRequest (Node.js) to web standard Request (required by Clerk SDK)
    const webRequest = toWebRequest(req);

    const authState = await clerkClient.authenticateRequest(webRequest, {
      authorizedParties: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'],
    });

    // Check if authentication succeeded (using isAuthenticated, isSignedIn is deprecated)
    if (!authState.isAuthenticated) {
      throw new AuthError('Unauthorized', 401);
    }

    // Extract userId from the auth object
    const auth = authState.toAuth();
    const clerkUserId = auth.userId;

    // Fetch user from Supabase using Clerk ID
    // eslint-disable-next-line prefer-const
    let { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, clerk_user_id')
      .eq('clerk_user_id', clerkUserId)
      .single<{ id: string; clerk_user_id: string }>();

    // If user doesn't exist, create them (fallback for webhook failures)
    if (error || !user) {
      console.log(`[Auth] User not found in database, creating for Clerk ID: ${clerkUserId}`);

      // Fetch full user data from Clerk to get email
      let email: string | null = null;
      try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
      } catch (clerkError) {
        console.error('[Auth] Failed to fetch user from Clerk:', clerkError);
      }

      // Email is required, so throw error if we couldn't get it
      if (!email) {
        throw new AuthError('Could not retrieve user email from Clerk', 500);
      }

      // Create the user in Supabase
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email,
        })
        .select('id, clerk_user_id')
        .single<{ id: string; clerk_user_id: string }>();

      if (createError || !newUser) {
        console.error('[Auth] Failed to create user:', createError);
        throw new AuthError('Failed to create user in database', 500);
      }

      user = newUser;
      console.log(`[Auth] User created successfully: ${user.id}`);
    }

    return {
      userId: user.id,
      clerkId: clerkUserId,
    };
  } catch (error) {
    // If it's already an AuthError, rethrow it
    if (error instanceof AuthError) {
      throw error;
    }
    // Otherwise, it's a Clerk or database error - log the actual error
    console.error('[Auth Debug] Authentication error details:', error);
    throw new AuthError('Authentication failed', 401);
  }
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 * Useful for endpoints that work for both authenticated and anonymous users
 *
 * @param req - Vercel request object
 * @returns AuthResult if authenticated, null otherwise
 */
export async function optionalAuth(req: VercelRequest): Promise<AuthResult | null> {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}
