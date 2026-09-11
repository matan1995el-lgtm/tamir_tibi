"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  IconDashboard,
  IconInbox,
  IconWrench,
  IconGridIcon,
  IconMessageStar,
  IconSliders,
  IconSettingsGear,
  IconLogout,
  IconMenu,
  IconX,
  IconEdit,
  IconPalette,
  IconLayers,
  IconNewspaper,
  IconSearch,
  IconUsers,
} from "@/components/Icons";
import { ADMIN_ROLE_LABELS, roleCanAccess, type AdminRole } from "@/lib/site-data";

const NAV = [
  { href: "/admin", label: "לוח בקרה", icon: IconDashboard, exact: true, section: null },
  { href: "/admin/content", label: "תוכן עמודים", icon: IconEdit, section: "content" },
  { href: "/admin/pages", label: "עמודים", icon: IconLayers, section: "pages" },
  { href: "/admin/blog", label: "בלוג", icon: IconNewspaper, section: "blog" },
  { href: "/admin/design", label: "עיצוב", icon: IconPalette, section: "design" },
  { href: "/admin/seo", label: "SEO", icon: IconSearch, section: "seo" },
  { href: "/admin/leads", label: "לידים", icon: IconInbox, section: "leads" },
  { href: "/admin/services", label: "שירותים", icon: IconWrench, section: "services" },
  { href: "/admin/gallery", label: "גלריה", icon: IconGridIcon, section: "gallery" },
  { href: "/admin/testimonials", label: "המלצות", icon: IconMessageStar, section: "testimonials" },
  { href: "/admin/pricing", label: "מחירון", icon: IconSliders, section: "pricing" },
  { href: "/admin/menu", label: "תפריט ניווט", icon: IconMenu, section: "menu" },
  { href: "/admin/users", label: "משתמשים", icon: IconUsers, section: null, ownerOnly: true },
  { href: "/admin/settings", label: "הגדרות", icon: IconSettingsGear, section: null, ownerOnly: true },
] as const;

export default function AdminSidebar({ email, role }: { email: string; role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const visibleNav = NAV.filter((item) => {
    if (role === "owner") return true;
    if ("ownerOnly" in item && item.ownerOnly) return false;
    if (item.section === null) return true; // dashboard — everyone with panel access sees it
    return roleCanAccess(role, item.section);
  });

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button className="admin-sidebar-toggle" onClick={() => setOpen(true)} aria-label="פתיחת תפריט" style={{ position: "fixed", top: 16, insetInlineStart: 16, zIndex: 40 }}>
        <IconMenu />
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 45 }}
        />
      )}
      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img src="/brand/symbol-white.png" alt="Metaline" />
          <span>Metaline · ניהול</span>
          <button
            onClick={() => setOpen(false)}
            className="admin-sidebar-toggle"
            aria-label="סגירת תפריט"
            style={{ marginInlineStart: "auto" }}
          >
            <IconX />
          </button>
        </div>
        <nav className="admin-nav">
          {visibleNav.map((item) => {
            const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="who">
            <span>{email}</span>
            <span className={`role-badge role-badge-${role}`}>{ADMIN_ROLE_LABELS[role]}</span>
          </div>
          <button className="admin-logout-btn" onClick={logout}>
            <IconLogout /> יציאה
          </button>
        </div>
      </aside>
    </>
  );
}
