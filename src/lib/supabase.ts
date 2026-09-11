import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public, browser-safe client. Only ever used for anonymous, RLS-gated
// operations (e.g. inserting a new lead from the contact form).
export const supabase = createClient(url, anonKey);
