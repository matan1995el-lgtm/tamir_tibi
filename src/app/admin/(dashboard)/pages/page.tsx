import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import PagesManager from "@/components/admin/PagesManager";
import type { ContentBlock, CustomPage } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function AdminPagesListPage() {
  await requireAdminAccess({ section: "pages" });
  const supabase = await createClient();

  const { data } = await supabase
    .from("custom_pages")
    .select("id, slug, title, blocks, seo_title, seo_description, og_image_url, published, updated_at")
    .order("updated_at", { ascending: false });

  const pages: CustomPage[] = (data ?? []).map((p) => ({
    ...p,
    blocks: (Array.isArray(p.blocks) ? p.blocks : []) as ContentBlock[],
  }));

  return (
    <>
      <AdminTopbar crumb="ניהול" title="עמודים" />
      <div className="admin-content">
        <p style={{ margin: "-8px 0 22px", fontSize: 13.5, color: "var(--muted)" }}>
          עמודים מותאמים אישית, נוספים ומתפרסמים באתר בכתובת <code dir="ltr">metaline.co.il/הסלאג-שנבחר</code>. כדי שיופיעו בתפריט הניווט, הוסיפו קישור אליהם במסך &quot;תפריט ניווט&quot;.
        </p>
        <PagesManager initialPages={pages} />
      </div>
    </>
  );
}
