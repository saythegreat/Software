/**
 * GET /api/auth/session
 * Returns the current session user from the JWT cookie.
 * Used by AuthProvider to hydrate client-side state on mount.
 */
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user });
}
