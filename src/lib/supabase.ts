import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Missing Supabase environment variables. Check your .env file.');
}

if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
  console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid. Supabase keys should start with "eyJ". You might have used a Stripe key by mistake.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

