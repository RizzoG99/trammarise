import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../src/lib/supabase/admin';

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
 * Middleware to require authentication for API routes
 * Validates JWT from Clerk and fetches user from Supabase
 *
 * @returns User ID (internal UUID) and Clerk user ID
 * @throws AuthError if authentication fails
 *
 * @example
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   const { userId } = await requireAuth();
 *   // ... proceed with authenticated logic
 * }
 */
export async function requireAuth(): Promise<AuthResult> {
  // Extract userId from Clerk JWT
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    throw new AuthError('Unauthorized', 401);
  }

  // Fetch user from Supabase
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, clerk_user_id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error || !user) {
      throw new AuthError('User not found in database', 404);
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
    // Otherwise, it's a database error - rethrow with original message
    throw error;
  }
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export async function optionalAuth(): Promise<AuthResult | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
