import type { Metadata } from "next";
import Link from "next/link";
import { GateDivider } from "@/components/HeroScene";
import { getPublishedBlogPosts } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  // Root layout's title.template ("%s | Metaline") appends the brand —
  // a literal "| Metaline" here would double it up.
  title: "בלוג",
  description: "מאמרים, טיפים והשראה בנושאי שערים חשמליים, מעקות אלומיניום, פרגולות ומחיצות מתכת.",
};

export default async function BlogListPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">תוכן ותובנות</span>
          <h1>הבלוג של Metaline</h1>
          <p>טיפים, מדריכים והשראה בעולם האלומיניום והמתכת — מהמומחים שלנו.</p>
        </div>
      </section>

      <GateDivider />

      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center" }}>עדיין אין פוסטים בבלוג — חזרו לבקר בקרוב.</p>
          ) : (
            <div className="blog-grid reveal-stagger">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image_url} alt="" className="blog-card-img" />
                  ) : (
                    <div className="blog-card-img blog-card-img-empty" aria-hidden="true" />
                  )}
                  <div className="blog-card-body">
                    {post.category && <span className="blog-card-cat">{post.category}</span>}
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    {post.published_at && (
                      <span className="blog-card-date">{new Date(post.published_at).toLocaleDateString("he-IL")}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
