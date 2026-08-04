import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the public anon key — safe here because every
// query it issues relies on the RLS policies from 0001_init.sql
// (public read on categories/active products, public insert on whatsapp_clicks).
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
