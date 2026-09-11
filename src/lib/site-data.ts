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
  logo_url: string | null;
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
  logo_url: null,
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

// --- Editable page text/images (admin "תוכן עמודים" screen) ---------------
//
// Stored as one loosely-typed JSON blob per page so the DB schema stays
// simple; each page type below defines the actual known fields. Every
// field is optional and every page component falls back to the site's
// original hardcoded copy when a field is empty — so an unmigrated DB,
// an unreachable Supabase project, or an admin who hasn't filled
// something in yet all render exactly like the original static page,
// never a blank gap or a literal "undefined".

export type HomeContent = {
  hero_eyebrow?: string;
  hero_title_main?: string;
  hero_title_accent?: string;
  hero_lead?: string;
  about_title?: string;
  about_body?: string;
  about_image_url?: string;
  cta_title?: string;
  cta_body?: string;
};

export type AboutContent = {
  hero_title?: string;
  hero_lead?: string;
  story_title?: string;
  story_body_1?: string;
  story_body_2?: string;
  story_image_url?: string;
};

export type ContactContent = {
  hero_title?: string;
  hero_lead?: string;
};

async function getPageContent<T>(page: "home" | "about" | "contact"): Promise<T> {
  const { data, error } = await supabase.from("page_content").select("data").eq("page", page).maybeSingle();
  if (error || !data) return {} as T;
  return (data.data ?? {}) as T;
}

export const getHomeContent = () => getPageContent<HomeContent>("home");
export const getAboutContent = () => getPageContent<AboutContent>("about");
export const getContactContent = () => getPageContent<ContactContent>("contact");

// --- Navigation menu (admin "תפריט ניווט" screen) --------------------------

export type NavMenuItem = {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  open_in_new_tab: boolean;
};

// Shown if the table is empty (shouldn't happen — it's seeded by the
// migration) or unreachable, so the header never renders with no links.
const DEFAULT_NAV: NavMenuItem[] = [
  { id: "default-home", label: "בית", href: "/", sort_order: 0, open_in_new_tab: false },
  { id: "default-about", label: "אודות", href: "/about", sort_order: 1, open_in_new_tab: false },
  { id: "default-services", label: "שירותים", href: "/services", sort_order: 2, open_in_new_tab: false },
  { id: "default-gallery", label: "גלריה", href: "/gallery", sort_order: 3, open_in_new_tab: false },
  { id: "default-contact", label: "צור קשר", href: "/contact", sort_order: 4, open_in_new_tab: false },
];

// --- Site theme: accent color + font pair (admin "עיצוב" screen) ---------

export type FontPair = "classic" | "modern" | "elegant";

export type SiteTheme = {
  accent_color: string;
  accent_color_2: string;
  font_pair: FontPair;
};

export const FONT_STACKS: Record<FontPair, { heading: string; body: string }> = {
  classic: { heading: "'Rubik', sans-serif", body: "'Heebo', sans-serif" },
  modern: { heading: "'Assistant', sans-serif", body: "'Assistant', sans-serif" },
  elegant: { heading: "'Secular One', sans-serif", body: "'Assistant', sans-serif" },
};

const DEFAULT_THEME: SiteTheme = { accent_color: "#D4AF37", accent_color_2: "#F0D074", font_pair: "classic" };

export async function getSiteTheme(): Promise<SiteTheme> {
  const { data, error } = await supabase.from("site_theme").select("accent_color, accent_color_2, font_pair").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_THEME;
  const fontPair: FontPair = data.font_pair in FONT_STACKS ? (data.font_pair as FontPair) : "classic";
  return {
    accent_color: data.accent_color || DEFAULT_THEME.accent_color,
    accent_color_2: data.accent_color_2 || DEFAULT_THEME.accent_color_2,
    font_pair: fontPair,
  };
}

export async function getNavMenuItems(): Promise<NavMenuItem[]> {
  const { data, error } = await supabase
    .from("nav_menu_items")
    .select("id, label, href, sort_order, open_in_new_tab")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return DEFAULT_NAV;
  return data as NavMenuItem[];
}
