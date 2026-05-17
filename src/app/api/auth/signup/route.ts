/**
 * POST /api/auth/signup
 * Registers a new user, hashes their password, and sends a Brevo verification email.
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../../../lib/supabase-server';
import { sendVerificationEmail } from '../../../lib/brevo';

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
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      // Resend verification for unverified account
      const token = uuidv4();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('custom_users')
        .update({ verify_token: token, verify_token_expires_at: expires })
        .eq('email', email.toLowerCase());
      await sendVerificationEmail(email, full_name, token);
      return NextResponse.json({ message: 'Verification email resent. Check your inbox.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verify_token = uuidv4();
    const verify_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Insert user
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
      return NextResponse.json({ error: 'Failed to create account.' }, { status: 500 });
    }

    // Send verification email via Brevo
    await sendVerificationEmail(email, full_name.trim(), verify_token);

    return NextResponse.json({
      message: 'Account created! Please check your email to verify your account.',
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
