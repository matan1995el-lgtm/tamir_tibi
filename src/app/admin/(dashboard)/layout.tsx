import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth: proxy.ts already redirects unauthenticated visitors,
  // but every server entry point re-checks per Next.js's own guidance.
  if (!user) {
    redirect("/admin/login");
  }

  // Being a valid Supabase Auth user is not enough on its own — an admin
  // whose access was revoked (their admin_users row deleted from the
  // "משתמשים" screen) still has a live login session, so the admin panel
  // itself must also check for an admin_users row and bounce them out if
  // it's gone. (The matching RLS policies enforce the same rule on every
  // table directly, so this is belt-and-suspenders, not the only gate.)
  const admin = await getCurrentAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?revoked=1");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar email={admin.email} role={admin.role} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
