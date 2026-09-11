import { supabase } from "@/lib/supabase";

// Server-side read helpers for public content. These use the plain
// anon-key client (no cookies/auth needed — RLS already grants public
// SELECT on published rows) so pages stay simple to call from Server
// Components. Combined with `export const revalidate = 60` on the pages
// that use them, edits made in the admin panel show up on the live site
// within about a minute without a redeploy.

export type SiteSettings = {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  years_in_business: number | null;
  projects_count: number | null;
  warranty_years: number | null;
};

const EMPTY_SETTINGS: SiteSettings = {
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  hours: null,
  facebook_url: null,
  instagram_url: null,
  years_in_business: null,
  projects_count: null,
  warranty_years: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return EMPTY_SETTINGS;
  return data as SiteSettings;
}

/**
 * A short "or reach us at ..." phrase for form-error messages, built from
 * whichever real contact channel is set in the admin panel. Returns
 * undefined (never a "[להשלמה: ...]" placeholder) when nothing is set yet —
 * a visitor should never see an unfilled bracket in a live error message.
 */
export function formatContactFallback(settings: SiteSettings): string | undefined {
  if (settings.phone) return `בטלפון ${settings.phone}`;
  if (settings.whatsapp) return `בוואטסאפ ${settings.whatsapp}`;
  if (settings.email) return `במייל ${settings.email}`;
  return undefined;
}

export type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export async function getServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, slug, title, description, icon, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as ServiceRow[];
}

export async function getServiceBySlug(slug: string): Promise<ServiceRow | null> {
  const { data, error } = await supabase
    .from("services")
    .select("id, slug, title, description, icon, sort_order")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as ServiceRow;
}

export type GalleryProject = {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  sort_order: number;
};

export async function getGalleryProjects(category?: string): Promise<GalleryProject[]> {
  let query = supabase
    .from("gallery_projects")
    .select("id, title, category, image_url, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (category && category !== "הכל") {
    query = query.eq("category", category);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data as GalleryProject[];
}

export type TestimonialRow = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  rating: number;
};

export async function getTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote, author_name, author_role, rating")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as TestimonialRow[];
}

export type PricingItem = {
  id: string;
  title: string;
  amount_label: string;
  description: string | null;
  sort_order: number;
};

export async function getPricingItems(): Promise<PricingItem[]> {
  const { data, error } = await supabase
    .from("pricing_items")
    .select("id, title, amount_label, description, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as PricingItem[];
}
