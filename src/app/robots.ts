import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/site-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // The admin "SEO" screen has a global "allow indexing" switch — flipping
  // it off (e.g. while the site isn't ready for the public yet) disallows
  // everything here instead of just /admin.
  let allowIndexing = true;
  try {
    allowIndexing = (await getSeoSettings()).robots_index;
  } catch {
    // Offline/build-time fallback: default to allowing indexing.
  }

  return {
    rules: allowIndexing
      ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
