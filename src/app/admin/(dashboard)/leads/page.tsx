import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import LeadsTable, { type Lead } from "@/components/admin/LeadsTable";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireAdminAccess({ section: "leads" });
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, phone, email, service, area, message, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminTopbar crumb="ניהול" title="לידים" />
      <div className="admin-content">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>כל הלידים</h2>
          </div>
          <LeadsTable initialLeads={(leads ?? []) as Lead[]} />
        </div>
      </div>
    </>
  );
}
