import { NextResponse } from 'next/server';
import { auth0, isAuth0Configured } from '@/lib/auth0';

export async function ensureAuthenticated() {
  if (!isAuth0Configured || !auth0) {
    return NextResponse.json(
      { error: 'Authentication is not configured on this server' },
      { status: 503 }
    );
  }

  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
