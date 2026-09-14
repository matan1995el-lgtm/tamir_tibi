import { createClient } from "@/lib/supabase-server";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { IconInbox, IconGridIcon, IconWrench, IconMessageStar } from "@/components/Icons";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { roleCanAccess } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const admin = await getCurrentAdmin();

  // This landing page has no single `section` to gate with requireAdminAccess
  // (every role lands here after login), so each KPI/panel below is shown
  // only when the signed-in role actually has that section — otherwise a
  // designer/SEO account would see real lead names/phones and other admins'
  // data on the one page requireAdminAccess can't protect (it redirects
  // *here* on denial, so this page must never itself require a section).
  const can = (section: string) => !!admin && (admin.role === "owner" || roleCanAccess(admin.role, section));
  const canSeeLeads = can("leads");
  const canSeeServices = can("services");
  const canSeeGallery = can("gallery");
  const canSeeTestimonials = can("testimonials");

  const [leadsTotal, leadsNew, services, gallery, testimonials] = await Promise.all([
    canSeeLeads
      ? supabase.from("leads").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: null }),
    canSeeLeads
      ? supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new")
      : Promise.resolve({ count: null }),
    canSeeServices
      ? supabase.from("services").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: null }),
    canSeeGallery
      ? supabase.from("gallery_projects").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: null }),
    canSeeTestimonials
      ? supabase.from("testimonials").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: null }),
  ]);

  const { data: recentLeads } = canSeeLeads
    ? await supabase
        .from("leads")
        .select("id, name, phone, service, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null };

  const kpis = [
    canSeeLeads && { label: "לידים חדשים", value: leadsNew.count ?? 0, icon: IconInbox },
    canSeeLeads && { label: 'סה"כ לידים', value: leadsTotal.count ?? 0, icon: IconInbox },
    canSeeServices && { label: "שירותים פעילים", value: services.count ?? 0, icon: IconWrench },
    canSeeGallery && { label: "פריטי גלריה", value: gallery.count ?? 0, icon: IconGridIcon },
    canSeeTestimonials && { label: "המלצות", value: testimonials.count ?? 0, icon: IconMessageStar },
  ].filter((k): k is { label: string; value: number; icon: typeof IconInbox } => !!k);

  return (
    <>
      <AdminTopbar crumb="ניהול" title="לוח בקרה" />
      <div className="admin-content">
        <div className="kpi-grid">
          {kpis.map((k) => (
            <div className="kpi-card" key={k.label}>
              <div>
                <div className="lbl">{k.label}</div>
                <div className="val">{k.value}</div>
              </div>
              <div className="ic">
                <k.icon />
              </div>
            </div>
          ))}
        </div>

        {canSeeLeads && (
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>לידים אחרונים</h2>
            <Link href="/admin/leads" className="abtn abtn-ghost abtn-sm">
              לכל הלידים
            </Link>
          </div>
          {!recentLeads || recentLeads.length === 0 ? (
            <div className="aempty">
              <IconInbox />
              <p>עדיין אין לידים. ברגע שמישהו ישלח פנייה מהאתר, היא תופיע כאן.</p>
            </div>
          ) : (
            <div className="atable-wrap">
              <table className="atable">
                <thead>
                  <tr>
                    <th>שם</th>
                    <th>טלפון</th>
                    <th>שירות</th>
                    <th>סטטוס</th>
                    <th>תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((l) => (
                    <tr key={l.id}>
                      <td>{l.name}</td>
                      <td>{l.phone}</td>
                      <td>{l.service ?? "—"}</td>
                      <td>
                        <span className={`abadge abadge-${l.status}`}>{statusLabel(l.status)}</span>
                      </td>
                      <td>{new Date(l.created_at).toLocaleDateString("he-IL")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {canSeeTestimonials && testimonials.count === 0 && (
          <div className="admin-panel" style={{ borderColor: "rgba(212,175,55,.3)" }}>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>
              טיפ: עדיין אין המלצות לקוחות באתר. אפשר להוסיף אותן בעמוד{" "}
              <Link href="/admin/testimonials" style={{ color: "var(--gold-2)" }}>
                המלצות
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "new":
      return "חדש";
    case "contacted":
      return "נוצר קשר";
    case "won":
      return "נסגר";
    case "lost":
      return "אבד";
    default:
      return status;
  }
}
