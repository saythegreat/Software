/**
 * POST /api/auth/verify
 * Validates the 6-digit email verification code and marks the user as verified.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { createSession, COOKIE_NAME, MAX_AGE } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
    }

    // Look up user by email
    const { data: user, error } = await supabaseAdmin
      .from('custom_users')
      .select('id, email, full_name, verify_token, verify_token_expires_at, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.email_verified) {
      return NextResponse.json({ error: 'Email already verified.' }, { status: 400 });
    }

    if (user.verify_token !== code) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    // Check token expiry
    if (new Date(user.verify_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code expired. Please sign up again.' }, { status: 400 });
    }

    // Mark as verified and clear the token
    const { error: updateError } = await supabaseAdmin
      .from('custom_users')
      .update({ email_verified: true, verify_token: null, verify_token_expires_at: null })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
    }

    // Create session JWT
    const jwt = await createSession({ id: user.id, email: user.email, full_name: user.full_name });
    const res = NextResponse.json({ message: 'Email verified successfully!' });
    res.cookies.set(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    
    return res;
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
