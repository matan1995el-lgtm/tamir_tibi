import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SeoForm from "@/components/admin/SeoForm";
import type { SeoSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  await requireAdminAccess({ section: "seo" });
  const supabase = await createClient();

  const { data } = await supabase
    .from("seo_settings")
    .select("default_meta_title, default_meta_description, default_og_image_url, google_site_verification, robots_index")
    .eq("id", 1)
    .maybeSingle();

  const initial: SeoSettings = data ?? {
    default_meta_title: null,
    default_meta_description: null,
    default_og_image_url: null,
    google_site_verification: null,
    robots_index: true,
  };

  return (
    <>
      <AdminTopbar crumb="ניהול" title="SEO" />
      <div className="admin-content">
        <SeoForm initial={initial} />
      </div>
    </>
  );
}
