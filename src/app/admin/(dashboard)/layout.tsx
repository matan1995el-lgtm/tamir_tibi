import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
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

  return (
    <div className="admin-shell">
      <AdminSidebar email={user.email ?? ""} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
