import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isValidPhone, normalizePhone } from "@/lib/phone";

// Every quote-request submission (the popup modal and the /contact page
// form both post here) goes to two places:
//  1. Supabase `leads` — so it shows up in the admin panel's לידים tab.
//  2. The agency's existing Formspree form — so it also arrives by email
//     right away, without needing a separate email-sending service wired
//     up. https://formspree.io/f/meaqloeb ("שאלון מטאליין1").
// A Formspree failure never blocks the lead from being saved — the DB
// insert is the source of truth; email is a best-effort notification.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/meaqloeb";

// Best-effort in-memory rate limit — a fixed window per IP, kept in module
// scope so it persists across requests on the same warm serverless
// instance. This is NOT a strong guarantee (a cold start or a request
// routed to a different instance resets it, and there's no shared store
// like Redis here), but it stops the common case of a simple script
// flooding this endpoint with repeated requests, on top of the honeypot
// below which only catches naive bots that fill every field.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
const rateLimitHits = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitHits.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitHits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

export async function POST(req: Request) {
  // Vercel sets x-forwarded-for on every request; fall back to a constant
  // key (shared limit across all unidentifiable callers) rather than
  // skipping the check entirely if it's ever missing.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
    service?: string;
    area?: string;
    website?: string;
    idempotency_key?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: a field named to look real ("website") that both public
  // forms render visually hidden and never ask a person to fill in.
  // Bots that blindly fill every field in a scraped form trip it; a real
  // visitor never sees or fills it. Report success without writing
  // anything — a bot that gets an error response just learns to retry.
  if ((body.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  const service = (body.service ?? "").trim();
  const area = (body.area ?? "").trim();
  const idempotencyKey = (body.idempotency_key ?? "").trim() || null;

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  }

  // A retried submission (client got no response the first time — lost
  // connection, timeout — and tried again) carries the same idempotency
  // key both times. If a lead with this key already exists, the first
  // attempt actually succeeded server-side; report success again without
  // inserting a second row, instead of creating a duplicate lead.
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true });
    }
  }

  const { error } = await supabase.from("leads").insert({
    name,
    phone: normalizePhone(phone),
    email: email || null,
    message: message || null,
    service: service || null,
    area: area || null,
    status: "new",
    idempotency_key: idempotencyKey,
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
        area: area || undefined,
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
