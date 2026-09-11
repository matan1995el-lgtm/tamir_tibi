import { createClient } from "@/lib/supabase-server";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { IconInbox, IconGridIcon, IconWrench, IconMessageStar } from "@/components/Icons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [leadsTotal, leadsNew, services, gallery, testimonials] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("gallery_projects").select("id", { count: "exact", head: true }),
    supabase.from("testimonials").select("id", { count: "exact", head: true }),
  ]);

  const { data: recentLeads } = await supabase
    .from("leads")
    .select("id, name, phone, service, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const kpis = [
    { label: "לידים חדשים", value: leadsNew.count ?? 0, icon: IconInbox },
    { label: 'סה"כ לידים', value: leadsTotal.count ?? 0, icon: IconInbox },
    { label: "שירותים פעילים", value: services.count ?? 0, icon: IconWrench },
    { label: "פריטי גלריה", value: gallery.count ?? 0, icon: IconGridIcon },
    { label: "המלצות", value: testimonials.count ?? 0, icon: IconMessageStar },
  ];

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

        {testimonials.count === 0 && (
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
