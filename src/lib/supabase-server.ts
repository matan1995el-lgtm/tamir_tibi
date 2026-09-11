import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for use in Server Components, Route Handlers,
// and Server Actions inside the admin panel. Reads/writes the auth session
// via cookies so it works with @supabase/ssr's SSR auth flow.
export async function createClient() {
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
            // Called from a Server Component without a mutable response —
            // safe to ignore since middleware refreshes the session cookie.
          }
        },
      },
    }
  );
}
