import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import BlogManager from "@/components/admin/BlogManager";
import type { BlogPost, ContentBlock } from "@/lib/site-data";

export const dynamic = "force-dynamic";

const SELECT_FIELDS =
  "id, slug, title, excerpt, cover_image_url, blocks, category, tags, author_name, seo_title, seo_description, published, published_at, updated_at";

export default async function AdminBlogListPage() {
  await requireAdminAccess({ section: "blog" });
  const supabase = await createClient();

  const { data } = await supabase.from("blog_posts").select(SELECT_FIELDS).order("updated_at", { ascending: false });

  const posts: BlogPost[] = (data ?? []).map((p) => ({
    ...p,
    blocks: (Array.isArray(p.blocks) ? p.blocks : []) as ContentBlock[],
    tags: p.tags ?? [],
  }));

  return (
    <>
      <AdminTopbar crumb="ניהול" title="בלוג" />
      <div className="admin-content">
        <p style={{ margin: "-8px 0 22px", fontSize: 13.5, color: "var(--muted)" }}>
          פוסטים מתפרסמים בכתובת <code dir="ltr">metaline.co.il/blog/הסלאג-שנבחר</code> ומופיעים ברשימה בעמוד <code dir="ltr">/blog</code>.
        </p>
        <BlogManager initialPosts={posts} />
      </div>
    </>
  );
}
