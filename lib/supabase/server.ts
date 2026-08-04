import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

// Server-only client. Uses the public anon key — safe here because every
// query it issues relies on the RLS policies from 0001_init.sql
// (public read on categories/active products, public insert on whatsapp_clicks).
// Wrapped in React's cache() so multiple lib/products.ts calls within the
// same request/render reuse one client instead of constructing a fresh one
// per call — pure server-side/ISR-regeneration efficiency, doesn't change
// behavior for the visitor's browser.
export const getSupabaseServerClient = cache(function getSupabaseServerClient() {
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
});
