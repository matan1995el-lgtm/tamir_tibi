import { createClient } from "@/lib/supabase-server";
import AdminTopbar from "@/components/admin/AdminTopbar";
import PageContentManager from "@/components/admin/PageContentManager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const supabase = await createClient();

  const { data } = await supabase.from("page_content").select("page, data");

  const byPage = new Map((data ?? []).map((row) => [row.page as string, row.data ?? {}]));

  return (
    <>
      <AdminTopbar crumb="ניהול" title="תוכן עמודים" />
      <div className="admin-content">
        <PageContentManager
          initialContent={{
            home: byPage.get("home") ?? {},
            about: byPage.get("about") ?? {},
            contact: byPage.get("contact") ?? {},
          }}
        />
      </div>
    </>
  );
}
