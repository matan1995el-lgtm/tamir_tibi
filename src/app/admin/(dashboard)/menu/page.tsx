import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import NavMenuManager from "@/components/admin/NavMenuManager";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireAdminAccess({ section: "menu" });
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("nav_menu_items")
    .select("id, label, href, sort_order, is_visible, open_in_new_tab")
    .order("sort_order", { ascending: true });

  return (
    <>
      <AdminTopbar crumb="ניהול" title="תפריט ניווט" />
      <div className="admin-content">
        <NavMenuManager initialItems={items ?? []} />
      </div>
    </>
  );
}
