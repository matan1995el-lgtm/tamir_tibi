import type { MetadataRoute } from "next";
import { getServices } from "@/lib/site-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

// Static routes of the public site (admin is intentionally excluded —
// see robots.ts). Service detail pages are appended dynamically below
// from the live Supabase data, so a new service shows up here with no
// code change once it's added in the admin panel.
const STATIC_ROUTES = [
  "",
  "/about",
  "/services",
  "/gallery",
  "/contact",
  "/accessibility",
  "/privacy",
  "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const services = await getServices();
    for (const service of services) {
      entries.push({
        url: `${SITE_URL}/services/${service.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // Build-time/offline environments without a reachable Supabase
    // project still produce a valid sitemap of the static routes.
  }

  return entries;
}
