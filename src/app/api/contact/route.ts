import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Every quote-request submission (the popup modal and the /contact page
// form both post here) goes to two places:
//  1. Supabase `leads` — so it shows up in the admin panel's לידים tab.
//  2. The agency's existing Formspree form — so it also arrives by email
//     right away, without needing a separate email-sending service wired
//     up. https://formspree.io/f/meaqloeb ("שאלון מטאליין1").
// A Formspree failure never blocks the lead from being saved — the DB
// insert is the source of truth; email is a best-effort notification.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/meaqloeb";

export async function POST(req: Request) {
  let body: { name?: string; phone?: string; email?: string; message?: string; service?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  const service = (body.service ?? "").trim();

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const { error } = await supabase.from("leads").insert({
    name,
    phone,
    email: email || null,
    message: message || null,
    service: service || null,
    status: "new",
  });

  if (error) {
    // Most likely cause right now: the `leads` table hasn't been created
    // yet in Supabase (schema migration pending), or DB access is down.
    console.error("contact form insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email: email || undefined,
        _replyto: email || undefined,
        service: service || "לא צוין",
        message: message || "—",
        _subject: `פנייה חדשה מהאתר — ${name}`,
      }),
    });
  } catch (formspreeError) {
    // Lead is already saved in Supabase — a failed email notification
    // is not fatal, just log it for visibility.
    console.error("formspree notification failed:", formspreeError);
  }

  return NextResponse.json({ ok: true });
}
