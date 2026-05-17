/**
 * Server-only Supabase client using the service role key.
 * This bypasses RLS — only import this in API routes (never in client components).
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
