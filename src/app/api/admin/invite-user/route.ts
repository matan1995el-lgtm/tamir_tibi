import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";

const VALID_ROLES = ["owner", "marketing", "designer", "seo"];

// Invites a new admin-panel user (sends them a real Supabase Auth invite
// email with a set-password link) and assigns their role. Only reachable
// by an existing "owner" — enforced twice: here (before touching the
// service-role client) and again by admin_users' own RLS policy as a
// backstop. Requires SUPABASE_SERVICE_ROLE_KEY to be set as a server-only
// environment variable (never exposed to the browser) — the Supabase
// Auth admin API (creating a user / sending an invite email) can only be
// called with that key, never the public anon key.
export async function POST(request: Request) {
  let body: { email?: string; full_name?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const fullName = body.full_name?.trim() || null;
  const role = body.role;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "כתובת אימייל תקינה נדרשת" }, { status: 400 });
  }
  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "תפקיד לא תקין" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "יש להתחבר לפאנל הניהול" }, { status: 401 });
  }

  const { data: me } = await supabase.from("admin_users").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "owner") {
    return NextResponse.json({ error: "רק בעלים יכולים להוסיף משתמשי ניהול חדשים" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      {
        error:
          "שליחת הזמנות דורשת הגדרה נוספת בשרת: משתנה הסביבה SUPABASE_SERVICE_ROLE_KEY (מתוך Supabase Dashboard → Project Settings → API → service_role) — יש להוסיף אותו ב-.env.local ובהגדרות הפרויקט בוורסל, ואז לפרוס מחדש.",
      },
      { status: 500 }
    );
  }

  const admin = createServiceClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const origin = new URL(request.url).origin;
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/admin/reset-password`,
  });

  if (inviteError || !invited?.user) {
    const message = inviteError?.message?.toLowerCase().includes("already")
      ? "כבר קיים משתמש רשום עם כתובת המייל הזו"
      : inviteError?.message || "שליחת ההזמנה נכשלה";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { error: insertError } = await admin
    .from("admin_users")
    .upsert({ id: invited.user.id, email, full_name: fullName, role }, { onConflict: "id" });

  if (insertError) {
    return NextResponse.json(
      { error: `ההזמנה נשלחה בהצלחה אך שיוך התפקיד נכשל: ${insertError.message}. אפשר לשייך תפקיד ידנית מרשימת המשתמשים.` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: invited.user.id, email, full_name: fullName, role });
}
