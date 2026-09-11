import { createClient } from "@/lib/supabase-server";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select(
      "id, phone, whatsapp, email, address, hours, facebook_url, instagram_url, years_in_business, projects_count, warranty_years, updated_at"
    )
    .eq("id", 1)
    .single();

  return (
    <>
      <AdminTopbar crumb="ניהול" title="הגדרות" />
      <div className="admin-content">
        <p style={{ margin: "-8px 0 22px", fontSize: 13.5, color: "var(--muted)" }}>
          הפרטים כאן ישמשו בהמשך להחלפת ה"[להשלמה]" שמופיעים כרגע באתר הציבורי, כמו בעמוד יצירת הקשר ובפוטר.
        </p>
        <SettingsForm initialSettings={settings ?? null} />
      </div>
    </>
  );
}
