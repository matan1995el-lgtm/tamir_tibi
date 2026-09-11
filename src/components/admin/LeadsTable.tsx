"use client";

import { useMemo, useRef, useState } from "react";
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
  IconDownload,
  IconPhoneCall,
} from "@/components/Icons";

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2Zm5.8 14.11c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.07.18-.28.36-.23.6-.14.24.09 1.55.73 1.81.86.26.14.44.2.5.31.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

function waLink(rawPhone: string): string {
  const digits = rawPhone.replace(/[^\d]/g, "");
  if (digits.startsWith("972")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/972${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function csvEscape(value: string): string {
  const v = value.replace(/"/g, '""');
  return /[",\n]/.test(v) ? `"${v}"` : v;
}

function downloadLeadsCsv(rows: Lead[]) {
  const headers = ["שם", "טלפון", "אימייל", "שירות", "סטטוס", "הודעה", "תאריך"];
  const lines = [headers.map(csvEscape).join(",")];
  for (const l of rows) {
    lines.push(
      [
        l.name,
        l.phone,
        l.email ?? "",
        l.service ?? "",
        STATUS_LABELS[l.status],
        (l.message ?? "").replace(/\n/g, " "),
        new Date(l.created_at).toLocaleDateString("he-IL"),
      ]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
  }
  // BOM so Excel opens the Hebrew text as UTF-8 instead of mangling it.
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `לידים-מטאליין-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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

// A plain helper (not a component) so it isn't re-declared every render —
// takes the current sort state as arguments instead of closing over it.
function renderSortIcon(column: SortKey, sortKey: SortKey, sortDir: SortDir) {
  if (sortKey !== column) return null;
  return sortDir === "asc" ? <IconChevronUp /> : <IconChevronDown />;
}

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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const toastSeq = useRef(0);

  const hasAnyLeads = leads.length > 0;

  const statusCounts = useMemo(() => {
    const counts: Record<LeadStatus, number> = { new: 0, contacted: 0, won: 0, lost: 0 };
    for (const l of leads) counts[l.status] += 1;
    return counts;
  }, [leads]);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
    const filtered = leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      const created = new Date(l.created_at);
      if (from && created < from) return false;
      if (to && created > to) return false;
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
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
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

  return (
    <div>
      {hasAnyLeads && (
        <div className="lead-stats-row">
          <div className="lead-stat">
            <span className="lead-stat-n">{leads.length}</span>
            <span>סה&quot;כ</span>
          </div>
          {STATUS_FILTERS.filter((f) => f.key !== "all").map((f) => (
            <div key={f.key} className={`lead-stat lead-stat-${f.key}`}>
              <span className="lead-stat-n">{statusCounts[f.key as LeadStatus]}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      )}

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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="מתאריך"
            style={{
              background: "var(--ink-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 3,
              color: "var(--white)",
              padding: "9px 10px",
              fontSize: 12.5,
              fontFamily: "'Heebo', sans-serif",
              colorScheme: "dark",
            }}
          />
          <span style={{ color: "var(--muted)", fontSize: 12.5 }}>עד</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="עד תאריך"
            style={{
              background: "var(--ink-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 3,
              color: "var(--white)",
              padding: "9px 10px",
              fontSize: 12.5,
              fontFamily: "'Heebo', sans-serif",
              colorScheme: "dark",
            }}
          />

          <button
            type="button"
            className="abtn abtn-ghost abtn-sm"
            onClick={() => downloadLeadsCsv(filteredAndSorted)}
            disabled={filteredAndSorted.length === 0}
            title="ייצוא הרשימה המסוננת לקובץ CSV (נפתח באקסל)"
          >
            <IconDownload /> ייצוא ל-CSV
          </button>
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
                    שם {renderSortIcon("name", sortKey, sortDir)}
                  </span>
                </th>
                <th>טלפון</th>
                <th>אימייל</th>
                <th>שירות</th>
                <th className="sortable" onClick={() => toggleSort("status")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    סטטוס {renderSortIcon("status", sortKey, sortDir)}
                  </span>
                </th>
                <th className="sortable" onClick={() => toggleSort("created_at")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    תאריך {renderSortIcon("created_at", sortKey, sortDir)}
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
                      <a
                        className="abtn abtn-ghost abtn-sm"
                        href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                        title={`חיוג ל-${lead.name}`}
                      >
                        <IconPhoneCall />
                      </a>
                      <a
                        className="abtn abtn-ghost abtn-sm"
                        href={waLink(lead.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`וואטסאפ ל-${lead.name}`}
                      >
                        <WaIcon />
                      </a>
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
