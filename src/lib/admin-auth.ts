import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { roleCanAccess, type AdminRole } from "@/lib/site-data";

export type CurrentAdmin = {
  id: string;
  email: string;
  role: AdminRole;
};

/**
 * Resolves the logged-in admin user + their role (admin_users.role) for
 * the current request. Returns null if not logged in, or if logged in but
 * somehow missing an admin_users row (shouldn't happen for anyone created
 * through the invite flow or the initial-setup backfill migration —
 * treated as "no access" rather than silently defaulting to a role).
 *
 * This is a UI/UX convenience only (which nav links and buttons to show) —
 * the actual security boundary is the Postgres RLS policy on each table
 * (see supabase/schema.sql's current_admin_role() + per-table policies),
 * so a mistake here can make the UI show something a role can't use, but
 * can never let a role write something the database itself would refuse.
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;

  return { id: user.id, email: user.email ?? "", role: data.role as AdminRole };
}

/**
 * Server-side guard for an admin page that only some roles may open — the
 * matching UI-level check (AdminSidebar hides the link) is only ever a
 * convenience; this is what actually stops someone from reaching the page
 * directly by URL. Pass `ownerOnly: true` for owner-exclusive screens
 * (users, settings) instead of a `section` name. Redirects to /admin
 * (never /admin/login — the dashboard layout already established this is
 * a real logged-in admin, just not one allowed here) when denied.
 */
export async function requireAdminAccess(opts: { section?: string; ownerOnly?: boolean }): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const allowed = admin.role === "owner" || (opts.section ? roleCanAccess(admin.role, opts.section) : false);
  if (opts.ownerOnly ? admin.role !== "owner" : !allowed) {
    redirect("/admin");
  }
  return admin;
}
