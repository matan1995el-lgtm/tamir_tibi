import { createClient } from "@/lib/supabase-server";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ThemeForm from "@/components/admin/ThemeForm";

export const dynamic = "force-dynamic";

export default async function AdminDesignPage() {
  const supabase = await createClient();

  const { data: theme } = await supabase
    .from("site_theme")
    .select("accent_color, accent_color_2, font_pair, updated_at")
    .eq("id", 1)
    .single();

  return (
    <>
      <AdminTopbar crumb="ניהול" title="עיצוב" />
      <div className="admin-content">
        <p style={{ margin: "-8px 0 22px", fontSize: 13.5, color: "var(--muted)" }}>
          שינוי כאן משפיע רק על האתר הציבורי (הגוון והגופן בכל עמוד) — פאנל הניהול עצמו נשאר קבוע.
        </p>
        <ThemeForm initialTheme={theme ?? null} />
      </div>
    </>
  );
}
