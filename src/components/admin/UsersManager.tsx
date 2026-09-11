"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ADMIN_ROLE_LABELS, type AdminRole } from "@/lib/site-data";
import { IconPlus, IconTrash, IconCheck, IconX, IconUsers } from "@/components/Icons";

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  created_at: string;
};

type Toast = { id: number; kind: "ok" | "err"; message: string };
let toastSeq = 0;

const ROLES: AdminRole[] = ["owner", "marketing", "designer", "seo"];

export default function UsersManager({ initialUsers, currentUserId }: { initialUsers: AdminUserRow[]; currentUserId: string }) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialUsers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", role: "marketing" as AdminRole });
  const [inviting, setInviting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(kind: "ok" | "err", message: string) {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  }

  async function refetch() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: true });
    if (!error && data) setRows(data as AdminUserRow[]);
  }

  async function changeRole(row: AdminUserRow, role: AdminRole) {
    const supabase = createClient();
    const { error } = await supabase.from("admin_users").update({ role }).eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", `התפקיד של ${row.email} עודכן ל-${ADMIN_ROLE_LABELS[role]}`);
    await refetch();
  }

  async function removeUser(row: AdminUserRow) {
    if (row.id === currentUserId) {
      pushToast("err", "אי אפשר להסיר את המשתמש המחובר כרגע");
      return;
    }
    if (!window.confirm(`להסיר את הגישה של ${row.email} לפאנל הניהול?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("admin_users").delete().eq("id", row.id);
    if (error) {
      pushToast("err", error.message);
      return;
    }
    pushToast("ok", "הגישה הוסרה");
    await refetch();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שליחת ההזמנה נכשלה");
      pushToast("ok", `הזמנה נשלחה אל ${inviteForm.email}`);
      setInviteOpen(false);
      setInviteForm({ email: "", full_name: "", role: "marketing" });
      await refetch();
    } catch (err: unknown) {
      pushToast("err", err instanceof Error ? err.message : "שליחת ההזמנה נכשלה");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>משתמשי ניהול</h2>
        <button className="abtn abtn-gold" onClick={() => setInviteOpen(true)}>
          <IconPlus /> הזמנת משתמש
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="aempty">
          <IconUsers />
          <p>אין עדיין משתמשי ניהול רשומים.</p>
        </div>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th>שם</th>
                <th>אימייל</th>
                <th>תפקיד</th>
                <th>הצטרפ/ה</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-truncate">{row.full_name || "—"}</td>
                  <td className="cell-truncate" dir="ltr">{row.email}</td>
                  <td>
                    <select
                      value={row.role}
                      onChange={(e) => changeRole(row, e.target.value as AdminRole)}
                      disabled={row.id === currentUserId}
                      style={{ width: "auto", padding: "6px 10px", fontSize: 12.5 }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(row.created_at).toLocaleDateString("he-IL")}</td>
                  <td>
                    <div className="cell-actions">
                      <button
                        className="abtn abtn-danger abtn-sm"
                        onClick={() => removeUser(row)}
                        disabled={row.id === currentUserId}
                        title={row.id === currentUserId ? "לא ניתן להסיר את עצמך" : "הסרת גישה"}
                      >
                        <IconTrash /> הסרה
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inviteOpen && (
        <div className="amodal-overlay" onClick={() => !inviting && setInviteOpen(false)}>
          <div className="amodal" onClick={(e) => e.stopPropagation()}>
            <h3>הזמנת משתמש ניהול חדש</h3>
            <form onSubmit={handleInvite}>
              <div className="aform-grid">
                <div className="field full">
                  <label>אימייל</label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>שם מלא (אופציונלי)</label>
                  <input
                    type="text"
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>תפקיד</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as AdminRole })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
                תישלח למשתמש/ת הזמנה במייל עם קישור לבחירת סיסמה והתחברות לפאנל הניהול.
              </p>
              <div className="amodal-actions">
                <button type="submit" className="abtn abtn-gold" disabled={inviting}>
                  <IconCheck /> {inviting ? "שולח..." : "שליחת הזמנה"}
                </button>
                <button type="button" className="abtn abtn-ghost" onClick={() => setInviteOpen(false)} disabled={inviting}>
                  <IconX /> ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="atoast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`atoast atoast-${t.kind}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}
