import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GateDivider } from "@/components/HeroScene";
import { QuoteButton } from "@/components/QuoteModal";
import BlockRenderer from "@/components/BlockRenderer";
import { getBlogPostBySlug, getPublishedBlogPosts, getSeoSettings } from "@/lib/site-data";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const seo = await getSeoSettings();
  const description = post.seo_description || post.excerpt || seo.default_meta_description || undefined;
  const ogImage = post.cover_image_url || seo.default_og_image_url;
  // The admin's "כותרת SEO" field is documented as the literal title tag,
  // so when set it's used verbatim via `absolute` (bypassing the root
  // layout's "%s | Metaline" template — the admin already has full
  // control of the string). The generated fallback is just the post
  // title, left to the template to brand — appending "| Metaline"
  // ourselves here would double it up into "... | Metaline | Metaline".
  const fullTitle = post.seo_title || `${post.title} | Metaline`;
  return {
    title: post.seo_title ? { absolute: post.seo_title } : post.title,
    description,
    // Always set openGraph (never leave it `undefined`) — a child segment
    // that mentions the `openGraph` key at all replaces the root layout's
    // resolved OG data entirely, so the previous conditional pattern wiped
    // out the site-wide OG image/siteName/locale on every post without its
    // own cover image. Falls back to the site-wide default OG image when
    // this post has none of its own.
    openGraph: {
      title: fullTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">
            {post.category ?? "בלוג"}
            {post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString("he-IL")}` : ""}
          </span>
          <h1>{post.title}</h1>
          {post.excerpt && <p>{post.excerpt}</p>}
          {post.author_name && <p style={{ marginTop: 8, color: "var(--muted)", fontSize: 14 }}>מאת {post.author_name}</p>}
        </div>
      </section>

      <GateDivider />

      <section className="section tight">
        <div className="container" style={{ maxWidth: 780 }}>
          {post.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt={post.title}
              style={{ width: "100%", borderRadius: 16, marginBottom: 32, objectFit: "cover" }}
            />
          )}
          <BlockRenderer blocks={post.blocks} />
          {post.tags.length > 0 && (
            <div className="blog-tags">
              {post.tags.map((t) => (
                <span key={t} className="blog-tag">
                  #{t}
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 40 }}>
            <Link href="/blog" className="btn btn-ghost">
              ← חזרה לבלוג
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <span className="eyebrow">מוכנים להתחיל?</span>
            <h2>נשמח לשמוע על הפרויקט שלכם</h2>
            <p>השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת אישית, ללא התחייבות.</p>
          </div>
          <div className="cta-actions">
            <QuoteButton className="btn btn-gold">קבלו הצעת מחיר</QuoteButton>
          </div>
        </div>
      </section>
    </>
  );
}
