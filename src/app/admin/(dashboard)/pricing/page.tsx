import { createClient } from "@/lib/supabase-server";
import AdminTopbar from "@/components/admin/AdminTopbar";
import PricingManager from "@/components/admin/PricingManager";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const supabase = await createClient();

  const { data: pricingItems } = await supabase
    .from("pricing_items")
    .select("id, title, amount_label, description, sort_order, published, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <>
      <AdminTopbar crumb="ניהול" title="מחירון" />
      <div className="admin-content">
        <PricingManager initialItems={pricingItems ?? []} />
      </div>
    </>
  );
}
