import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

let supabaseClient = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (err) {
    console.error("⚠️ Failed to initialize Supabase client:", err.message);
  }
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = () => Boolean(supabaseClient);
