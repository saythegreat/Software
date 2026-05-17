/**
 * GET /api/auth/verify?token=<uuid>
 * Validates the email verification token and marks the user as verified.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-server';
import { createSession, COOKIE_NAME, MAX_AGE } from '../../../../lib/session';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify?error=missing_token', req.url));
  }

  // Look up user by token
  const { data: user, error } = await supabaseAdmin
    .from('custom_users')
    .select('id, email, full_name, verify_token_expires_at, email_verified')
    .eq('verify_token', token)
    .single();

  if (error || !user) {
    return NextResponse.redirect(new URL('/auth/verify?error=invalid_token', req.url));
  }

  if (user.email_verified) {
    // Already verified — just log them in
    const jwt = await createSession({ id: user.id, email: user.email, full_name: user.full_name });
    const res = NextResponse.redirect(new URL('/dashboard', req.url));
    res.cookies.set(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    return res;
  }

  // Check token expiry
  if (new Date(user.verify_token_expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/auth/verify?error=expired_token', req.url));
  }

  // Mark as verified and clear the token
  const { error: updateError } = await supabaseAdmin
    .from('custom_users')
    .update({ email_verified: true, verify_token: null, verify_token_expires_at: null })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.redirect(new URL('/auth/verify?error=server_error', req.url));
  }

  // Create session JWT and redirect to dashboard
  const jwt = await createSession({ id: user.id, email: user.email, full_name: user.full_name });
  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return res;
}
