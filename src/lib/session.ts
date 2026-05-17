/**
 * JWT session utilities — server-side only.
 * Uses `jose` for signing/verifying JWTs stored in an HttpOnly cookie.
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser } from '../types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-this-in-production'
);

const COOKIE_NAME = 'freshtrack_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds


/** Sign a JWT for the given user and set the session cookie. */
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return token;
}

/** Verify a session token. Returns the payload or null if invalid/expired. */
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/** Read and verify the session from the request cookie. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export { COOKIE_NAME, MAX_AGE };
export type { SessionUser };
