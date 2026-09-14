import type { Metadata, Viewport } from "next";
import "@fontsource/rubik/latin-500.css";
import "@fontsource/rubik/latin-600.css";
import "@fontsource/rubik/latin-700.css";
import "@fontsource/rubik/latin-800.css";
import "@fontsource/rubik/hebrew-500.css";
import "@fontsource/rubik/hebrew-600.css";
import "@fontsource/rubik/hebrew-700.css";
import "@fontsource/rubik/hebrew-800.css";
import "@fontsource/heebo/latin-300.css";
import "@fontsource/heebo/latin-400.css";
import "@fontsource/heebo/latin-500.css";
import "@fontsource/heebo/latin-600.css";
import "@fontsource/heebo/latin-700.css";
import "@fontsource/heebo/hebrew-300.css";
import "@fontsource/heebo/hebrew-400.css";
import "@fontsource/heebo/hebrew-500.css";
import "@fontsource/heebo/hebrew-600.css";
import "@fontsource/heebo/hebrew-700.css";
// The site-wide font pair is chosen at runtime in the admin panel's
// "עיצוב" screen (a curated list, not free text — see FONT_STACKS in
// site-data.ts), so every option it can pick is loaded unconditionally
// here and the actual active one is just a CSS custom property swap.
import "@fontsource/assistant/latin-400.css";
import "@fontsource/assistant/latin-500.css";
import "@fontsource/assistant/latin-600.css";
import "@fontsource/assistant/latin-700.css";
import "@fontsource/assistant/latin-800.css";
import "@fontsource/assistant/hebrew-400.css";
import "@fontsource/assistant/hebrew-500.css";
import "@fontsource/assistant/hebrew-600.css";
import "@fontsource/assistant/hebrew-700.css";
import "@fontsource/assistant/hebrew-800.css";
import "@fontsource/secular-one/latin-400.css";
import "@fontsource/secular-one/hebrew-400.css";
import "./globals.css";
import { getSeoSettings, getSiteSettings } from "@/lib/site-data";
import { safeJsonLd } from "@/lib/json-ld";

// NEXT_PUBLIC_SITE_URL should be set to the site's real production domain
// once one is assigned (see .env.example) — it's what makes shared-link
// previews (WhatsApp/Facebook/Google) resolve OG images and canonical URLs
// correctly. Falls back to a placeholder so the build never breaks without it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

// Without this the page has no viewport meta tag at all, so mobile
// browsers fall back to laying the page out at a desktop-ish width and
// then shrinking it to fit the screen — every fixed element (the mobile
// nav overlay, the WhatsApp/accessibility buttons, the sticky CTA bar)
// ends up positioned against that wrong, wider layout box instead of the
// real screen, which is what caused the overlap/clipping/off-screen bugs
// reported on mobile. `initialScale: 1` with no `maximumScale` keeps
// pinch-zoom available — locking it out would fight the accessibility
// widget's own font-scaling feature and hurt low-vision visitors.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e1318",
};

const DEFAULT_TITLE = "Metaline — פתרונות אלומיניום ומתכת ברמה אחרת";
const DEFAULT_DESCRIPTION =
  "Metaline מתמחה בייצור והתקנה של שערים חשמליים, מעקות אלומיניום, פרגולות ומחיצות מתכת בגימור פרימיום. עבודה מדויקת, חומרים איכותיים, ליווי מקצועי מהתכנון ועד ההתקנה.";

// Site-wide SEO defaults (title/description/OG image/Google verification)
// are editable in the admin panel's "SEO" screen — fetched here so the
// root layout's metadata always reflects the latest saved values without
// a redeploy (same ISR window as the rest of the public site).
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const title = seo.default_meta_title || DEFAULT_TITLE;
  const description = seo.default_meta_description || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s | Metaline",
    },
    description,
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    // Always emit OG/Twitter tags — even without an uploaded OG image —
    // so WhatsApp/Facebook/Google link previews show at least a title +
    // description card instead of nothing. Once a real image is uploaded
    // in the admin "SEO" screen it's added on top, never fabricated here.
    openGraph: {
      title,
      description,
      url: "/",
      siteName: "Metaline",
      locale: "he_IL",
      type: "website",
      ...(seo.default_og_image_url ? { images: [seo.default_og_image_url] } : {}),
    },
    twitter: {
      card: seo.default_og_image_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(seo.default_og_image_url ? { images: [seo.default_og_image_url] } : {}),
    },
    verification: seo.google_site_verification ? { google: seo.google_site_verification } : undefined,
  };
}

// Structured data (schema.org LocalBusiness) for Google's rich-result
// eligibility. Built only from fields the admin panel actually has real
// values for — never fabricated placeholders — so a business detail that
// hasn't been filled in yet (see SiteSettings) is simply omitted from the
// JSON-LD rather than emitted as an empty/placeholder string, which would
// otherwise risk a Search Console "missing field" or "invalid value"
// warning instead of no warning at all.
async function buildLocalBusinessJsonLd() {
  const settings = await getSiteSettings();
  const sameAs = [settings.facebook_url, settings.instagram_url].filter(
    (v): v is string => Boolean(v)
  );
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Metaline",
    url: SITE_URL,
  };
  if (settings.logo_url) jsonLd.image = settings.logo_url;
  if (settings.phone) jsonLd.telephone = settings.phone;
  if (settings.email) jsonLd.email = settings.email;
  if (settings.address) jsonLd.address = { "@type": "PostalAddress", streetAddress: settings.address };
  if (sameAs.length) jsonLd.sameAs = sameAs;
  return jsonLd;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = await buildLocalBusinessJsonLd();
  return (
    <html lang="he" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
