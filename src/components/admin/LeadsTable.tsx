"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  IconInbox,
  IconInboxEmpty,
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconTrash,
  IconX,
} from "@/components/Icons";

export type LeadStatus = "new" | "contacted" | "won" | "lost";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
};

type SortKey = "name" | "created_at" | "status";
type SortDir = "asc" | "desc";

type Toast = { id: number; text: string; type: "ok" | "err" };

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "חדש",
  contacted: "נוצר קשר",
  won: "נסגר",
  lost: "אבד",
};

const STATUS_FILTERS: { key: "all" | LeadStatus; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "new", label: "חדש" },
  { key: "contacted", label: "נוצר קשר" },
  { key: "won", label: "נסגר" },
  { key: "lost", label: "אבד" },
];

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const hasAnyLeads = leads.length > 0;

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "he");
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [leads, search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function addToast(text: string, type: "ok" | "err") {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  async function handleStatusChange(id: string, newStatus: LeadStatus) {
    // Revert only this row on failure — never snapshot/restore the whole
    // list, which would clobber any other optimistic change a user made
    // to a different row while this request was in flight.
    const prevStatus = leads.find((l) => l.id === id)?.status;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    setPendingId(id);
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", id);
    setPendingId(null);
    if (error) {
      if (prevStatus) {
        setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: prevStatus } : l)));
      }
      addToast("עדכון הסטטוס נכשל, נסה שוב", "err");
    } else {
      addToast("הסטטוס עודכן בהצלחה", "ok");
      router.refresh();
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`למחוק את הליד של "${name}"? הפעולה אינה הפיכה.`)) return;
    // Keep the removed row (and its position) so a failed delete can be
    // restored without discarding any other row's concurrent optimistic
    // update, unlike restoring a whole-list snapshot would.
    const removedIndex = leads.findIndex((l) => l.id === id);
    const removedLead = leads[removedIndex];
    setLeads((ls) => ls.filter((l) => l.id !== id));
    setPendingId(id);
    const { error } = await supabase.from("leads").delete().eq("id", id);
    setPendingId(null);
    if (error) {
      if (removedLead) {
        setLeads((ls) => {
          const next = [...ls];
          next.splice(Math.min(removedIndex, next.length), 0, removedLead);
          return next;
        });
      }
      addToast("מחיקת הליד נכשלה, נסה שוב", "err");
    } else {
      addToast("הליד נמחק", "ok");
      if (viewingLead?.id === id) setViewingLead(null);
      router.refresh();
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return null;
    return sortDir === "asc" ? <IconChevronUp /> : <IconChevronDown />;
  }

  return (
    <div>
      <div
        className="admin-panel-head"
        style={{ flexWrap: "wrap", gap: 12, marginBottom: 18 }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`abtn abtn-sm ${statusFilter === f.key ? "abtn-gold" : "abtn-ghost"}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 220 }}>
          <span
            style={{
              position: "absolute",
              insetInlineStart: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 16,
              height: 16,
              color: "var(--muted)",
              pointerEvents: "none",
            }}
          >
            <IconSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, טלפון או אימייל..."
            style={{
              width: "100%",
              background: "var(--ink-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 3,
              color: "var(--white)",
              padding: "10px 14px 10px 14px",
              paddingInlineStart: 36,
              fontSize: 13.5,
              fontFamily: "'Heebo', sans-serif",
            }}
          />
        </div>
      </div>

      {!hasAnyLeads ? (
        <div className="aempty">
          <IconInboxEmpty />
          <p>עדיין אין לידים. ברגע שמישהו ישלח פנייה מהאתר, היא תופיע כאן.</p>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="aempty">
          <IconInbox />
          <p>לא נמצאו לידים התואמים את החיפוש או הסינון שנבחר.</p>
          <button type="button" className="abtn abtn-ghost abtn-sm" onClick={resetFilters}>
            איפוס סינון
          </button>
        </div>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort("name")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    שם <SortIcon column="name" />
                  </span>
                </th>
                <th>טלפון</th>
                <th>אימייל</th>
                <th>שירות</th>
                <th className="sortable" onClick={() => toggleSort("status")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    סטטוס <SortIcon column="status" />
                  </span>
                </th>
                <th className="sortable" onClick={() => toggleSort("created_at")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    תאריך <SortIcon column="created_at" />
                  </span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td className="cell-truncate">{lead.email ?? "—"}</td>
                  <td className="cell-truncate">{lead.service ?? "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span className={`abadge abadge-${lead.status}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                      <select
                        value={lead.status}
                        disabled={pendingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        style={{
                          background: "var(--ink-2)",
                          border: "1px solid var(--line-2)",
                          borderRadius: 3,
                          color: "var(--white)",
                          padding: "5px 8px",
                          fontSize: 12.5,
                          fontFamily: "'Heebo', sans-serif",
                        }}
                      >
                        <option value="new">חדש</option>
                        <option value="contacted">נוצר קשר</option>
                        <option value="won">נסגר</option>
                        <option value="lost">אבד</option>
                      </select>
                    </div>
                  </td>
                  <td>{new Date(lead.created_at).toLocaleDateString("he-IL")}</td>
                  <td>
                    <div className="cell-actions">
                      <button
                        type="button"
                        className="abtn abtn-ghost abtn-sm"
                        onClick={() => setViewingLead(lead)}
                        title="צפייה"
                      >
                        <IconEye />
                      </button>
                      <button
                        type="button"
                        className="abtn abtn-danger abtn-sm"
                        onClick={() => handleDelete(lead.id, lead.name)}
                        disabled={pendingId === lead.id}
                        title="מחיקה"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewingLead && (
        <div className="amodal-overlay" onClick={() => setViewingLead(null)}>
          <div className="amodal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              פרטי ליד
              <button
                type="button"
                className="abtn abtn-ghost abtn-sm"
                onClick={() => setViewingLead(null)}
                title="סגירה"
                style={{ padding: 6 }}
              >
                <IconX />
              </button>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <DetailRow label="שם" value={viewingLead.name} />
              <DetailRow label="טלפון" value={viewingLead.phone} />
              <DetailRow label="אימייל" value={viewingLead.email ?? "—"} />
              <DetailRow label="שירות" value={viewingLead.service ?? "—"} />
              <DetailRow
                label="תאריך פנייה"
                value={new Date(viewingLead.created_at).toLocaleDateString("he-IL")}
              />
              <DetailRow
                label="סטטוס"
                value={<span className={`abadge abadge-${viewingLead.status}`}>{STATUS_LABELS[viewingLead.status]}</span>}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>הודעה</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {viewingLead.message?.trim() ? viewingLead.message : "לא נשלחה הודעה."}
                </p>
              </div>
            </div>

            <div className="amodal-actions">
              <button
                type="button"
                className="abtn abtn-danger abtn-sm"
                onClick={() => handleDelete(viewingLead.id, viewingLead.name)}
              >
                <IconTrash /> מחיקת ליד
              </button>
              <button type="button" className="abtn abtn-ghost abtn-sm" onClick={() => setViewingLead(null)}>
                סגירה
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="atoast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`atoast ${t.type === "ok" ? "atoast-ok" : "atoast-err"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14.5 }}>{value}</span>
    </div>
  );
}
