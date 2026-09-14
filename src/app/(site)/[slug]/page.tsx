import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GateDivider } from "@/components/HeroScene";
import BlockRenderer from "@/components/BlockRenderer";
import { getCustomPageBySlug, getPublishedCustomPages, getSeoSettings } from "@/lib/site-data";

export const revalidate = 60;

// This catch-all only ever matches a slug that ISN'T one of the site's
// static routes (about/services/gallery/contact/blog/accessibility/
// privacy/cookies/admin/api — see RESERVED_SLUGS in site-data.ts) since
// Next.js always resolves a static segment before falling through to a
// dynamic one like this.
export async function generateStaticParams() {
  const pages = await getPublishedCustomPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);
  if (!page) return {};
  const seo = await getSeoSettings();
  const description = page.seo_description || seo.default_meta_description || undefined;
  const ogImage = page.og_image_url || seo.default_og_image_url;
  // The admin's "כותרת SEO (תגית title)" field is the literal title tag,
  // so when set it's used verbatim via `absolute` (bypassing the root
  // layout's "%s | Metaline" template). The generated fallback is just
  // the page title, left to the template to brand — appending
  // "| Metaline" ourselves here would double it up.
  const fullTitle = page.seo_title || `${page.title} | Metaline`;
  return {
    title: page.seo_title ? { absolute: page.seo_title } : page.title,
    description,
    alternates: { canonical: `/${slug}` },
    // Always set openGraph (never leave it `undefined`) — a child segment
    // that mentions the `openGraph` key at all replaces the root layout's
    // resolved OG data entirely, so the previous conditional pattern wiped
    // out the site-wide OG image/siteName/locale on every custom page
    // without its own OG image. Falls back to the site-wide default.
    openGraph: {
      title: fullTitle,
      description,
      url: `/${slug}`,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{page.title}</h1>
        </div>
      </section>

      <GateDivider />

      <section className="section tight">
        <div className="container" style={{ maxWidth: 780 }}>
          <BlockRenderer blocks={page.blocks} />
        </div>
      </section>
    </>
  );
}
