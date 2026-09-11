import { createClient } from "@/lib/supabase-server";
import { requireAdminAccess } from "@/lib/admin-auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import UsersManager from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireAdminAccess({ ownerOnly: true });
  const supabase = await createClient();

  const { data } = await supabase
    .from("admin_users")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <>
      <AdminTopbar crumb="ניהול" title="משתמשים" />
      <div className="admin-content">
        <p style={{ margin: "-8px 0 22px", fontSize: 13.5, color: "var(--muted)" }}>
          ניהול מי יכול להתחבר לפאנל הניהול ומה מותר לו/ה לערוך. בעלים רואים ועורכים הכל; שאר התפקידים מוגבלים לתחומים הרלוונטיים בלבד — ההגבלה נאכפת ישירות במסד הנתונים, לא רק בתצוגה.
        </p>
        <UsersManager initialUsers={data ?? []} currentUserId={me.id} />
      </div>
    </>
  );
}
