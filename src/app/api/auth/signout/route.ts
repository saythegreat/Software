/**
 * POST /api/auth/signout
 * Clears the session cookie.
 */
import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '../../../lib/session';

export async function POST() {
  const res = NextResponse.json({ message: 'Signed out.' });
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}
