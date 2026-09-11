import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import GalleryManager from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdminAccess({ section: "gallery" });
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("gallery_projects")
    .select("id, title, category, image_url, sort_order, published, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminTopbar crumb="ניהול" title="גלריה" />
      <div className="admin-content">
        <GalleryManager initialItems={items ?? []} />
      </div>
    </>
  );
}
