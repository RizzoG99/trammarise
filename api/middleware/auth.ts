import type { VercelRequest } from '@vercel/node';
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
  userId: string; // = auth.uid() = public.users.id
}

/**
 * Middleware to require authentication for API routes.
 * Validates Supabase JWT from Authorization header.
 *
 * @example
 * const { userId } = await requireAuth(req);
 */
export async function requireAuth(req: VercelRequest): Promise<AuthResult> {
  const authHeader = req.headers['authorization'];
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const token = raw?.startsWith('Bearer ') ? raw.slice(7) : null;

  if (!token) {
    throw new AuthError('Missing authorization token', 401);
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new AuthError('Invalid or expired token', 401);
  }

  return { userId: user.id };
}

/**
 * Optional authentication — returns user if authenticated, null otherwise.
 */
export async function optionalAuth(req: VercelRequest): Promise<AuthResult | null> {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}
