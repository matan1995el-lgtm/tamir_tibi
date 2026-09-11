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
} from "@/components/Icons";

const NAV = [
  { href: "/admin", label: "לוח בקרה", icon: IconDashboard, exact: true },
  { href: "/admin/content", label: "תוכן עמודים", icon: IconEdit },
  { href: "/admin/design", label: "עיצוב", icon: IconPalette },
  { href: "/admin/leads", label: "לידים", icon: IconInbox },
  { href: "/admin/services", label: "שירותים", icon: IconWrench },
  { href: "/admin/gallery", label: "גלריה", icon: IconGridIcon },
  { href: "/admin/testimonials", label: "המלצות", icon: IconMessageStar },
  { href: "/admin/pricing", label: "מחירון", icon: IconSliders },
  { href: "/admin/menu", label: "תפריט ניווט", icon: IconMenu },
  { href: "/admin/settings", label: "הגדרות", icon: IconSettingsGear },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
          <div className="who">{email}</div>
          <button className="admin-logout-btn" onClick={logout}>
            <IconLogout /> יציאה
          </button>
        </div>
      </aside>
    </>
  );
}
