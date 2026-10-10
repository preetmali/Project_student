import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase admin client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}
