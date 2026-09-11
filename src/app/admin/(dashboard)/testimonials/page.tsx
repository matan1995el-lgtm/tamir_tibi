import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import TestimonialsManager from "@/components/admin/TestimonialsManager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await requireAdminAccess({ section: "testimonials" });
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("testimonials")
    .select("id, quote, author_name, author_role, rating, published, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminTopbar crumb="ניהול" title="המלצות" />
      <div className="admin-content">
        <TestimonialsManager initialItems={items ?? []} />
      </div>
    </>
  );
}
