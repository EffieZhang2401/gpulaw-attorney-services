import { NextRequest, NextResponse } from 'next/server';
import { auth0, isAuth0Configured } from './auth0';

/**
 * Verify the user is authenticated via Auth0 session.
 * Returns the user session or a 401 response.
 */
export async function requireApiAuth(request: NextRequest) {
  if (!isAuth0Configured || !auth0) {
    return { error: NextResponse.json({ error: 'Service unavailable' }, { status: 503 }) };
  }

  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { user: session.user };
  } catch {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
}

/**
 * Return a safe error response that never leaks internal details.
 */
export function safeErrorResponse(error: unknown, fallbackMessage: string) {
  const statusMessages: Record<string, { status: number; message: string }> = {
    'Rate limit exceeded': { status: 429, message: 'Service is busy. Please try again later.' },
  };

  if (error instanceof Error) {
    const mapped = statusMessages[error.message];
    if (mapped) {
      return NextResponse.json(
        { success: false, error: mapped.message },
        { status: mapped.status }
      );
    }
  }

  // Never expose internal error messages to clients
  console.error(`[API Error] ${fallbackMessage}:`, error instanceof Error ? error.message : 'Unknown error');

  return NextResponse.json(
    { success: false, error: fallbackMessage },
    { status: 500 }
  );
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter. For production, use Redis-backed solution.
 * Returns null if allowed, or an error response if rate limited.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 20,
  windowMs: number = 60_000
): NextResponse | null {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) } }
    );
  }

  return null;
}

/** Max request body size in bytes (500KB) */
const MAX_BODY_SIZE = 512_000;

/**
 * Parse and validate JSON body with size limit.
 */
export async function parseBody<T = Record<string, unknown>>(request: NextRequest): Promise<{ data?: T; error?: NextResponse }> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return { error: NextResponse.json({ error: 'Request body too large' }, { status: 413 }) };
  }

  try {
    const data = await request.json() as T;
    return { data };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) };
  }
}
