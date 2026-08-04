import { createBrowserClient } from "@supabase/ssr";

// Browser client used inside /admin client components (login form is a
// Server Action instead, but the image uploader needs a session-bound
// client to call supabase.storage.from('products').upload() directly).
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
