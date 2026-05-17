/**
 * POST /api/auth/update-name
 * Updates the full_name for the currently authenticated user.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, createSession, COOKIE_NAME, MAX_AGE } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { full_name } = await req.json();
  if (!full_name?.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('custom_users')
    .update({ full_name: full_name.trim() })
    .eq('id', sessionUser.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update name.' }, { status: 500 });
  }

  // Re-issue the JWT with the new name
  const updatedUser = { ...sessionUser, full_name: full_name.trim() };
  const jwt = await createSession(updatedUser);

  const res = NextResponse.json({ user: updatedUser });
  res.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return res;
}
