import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-bound Supabase client for /admin Server Components and Server
 * Actions — requests run as the logged-in user (role `authenticated`), so
 * the `authenticated`-scoped RLS policies from 0003_admin.sql apply.
 * Unlike lib/supabase/server.ts (anon-only, used by the public site), this
 * one carries the admin's session.
 */
export async function getSupabaseAuthedServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — safe to ignore since
            // middleware.ts already refreshes the session on every request.
          }
        },
      },
    }
  );
}
