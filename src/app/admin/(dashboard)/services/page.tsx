import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ServicesManager from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requireAdminAccess({ section: "services" });
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("id, slug, title, description, icon, sort_order, published, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <>
      <AdminTopbar crumb="ניהול" title="שירותים" />
      <div className="admin-content">
        <ServicesManager initialServices={services ?? []} />
      </div>
    </>
  );
}
