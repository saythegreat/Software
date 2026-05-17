/**
 * POST /api/auth/signup
 * Registers a new user, hashes password, sends Brevo verification email.
 * User must verify email before they can log in.
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendVerificationEmail } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('custom_users')
      .select('id, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.email_verified) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 409 }
        );
      }
      // Account exists but unverified — resend the verification email
      const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins
      await supabaseAdmin
        .from('custom_users')
        .update({ verify_token: token, verify_token_expires_at: expires })
        .eq('email', email.toLowerCase());
      await sendVerificationEmail(email, full_name, token);
      return NextResponse.json({
        message: 'Verification code resent! Check your inbox.',
        requiresVerification: true,
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Generate verification token (10m expiry)
    const verify_token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const verify_token_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Insert user — NOT verified yet
    const { error: insertError } = await supabaseAdmin
      .from('custom_users')
      .insert([{
        email: email.toLowerCase(),
        full_name: full_name.trim(),
        password_hash,
        email_verified: false,
        verify_token,
        verify_token_expires_at,
      }]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
    }

    // Send verification email via Brevo
    await sendVerificationEmail(email, full_name.trim(), verify_token);

    return NextResponse.json({
      message: 'Account created! Please check your email to verify your account.',
      requiresVerification: true,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
