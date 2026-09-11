"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("אימייל או סיסמה שגויים. נסה/י שוב.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function onResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setLoading(false);
    // Supabase itself doesn't error out for an unknown email (to avoid
    // leaking which addresses have an account) — an error here means an
    // actual send failure (bad format, rate limit, network).
    if (error) {
      setError("לא ניתן היה לשלוח את המייל כרגע. נסה/י שוב מאוחר יותר.");
    } else {
      setResetSent(true);
    }
  }

  function switchToForgot() {
    setMode("forgot");
    setError(null);
    setResetSent(false);
  }

  function switchToLogin() {
    setMode("login");
    setError(null);
    setResetSent(false);
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <img src="/brand/symbol-white.png" alt="Metaline" />
          <span>Metaline</span>
        </div>

        {mode === "login" ? (
          <>
            <h1>כניסה לפאנל הניהול</h1>
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="field">
                <label htmlFor="email">אימייל</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="field">
                <label htmlFor="password">סיסמה</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && <div className="form-status err">{error}</div>}
              <button type="submit" className="btn btn-gold" disabled={loading}>
                {loading ? "מתחבר..." : "כניסה"}
              </button>
              <button
                type="button"
                onClick={switchToForgot}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13.5, cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                שכחתי סיסמה
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>איפוס סיסמה</h1>
            {resetSent ? (
              <>
                <p style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.6 }}>
                  נשלח אליך קישור לאיפוס הסיסמה, בדוק/י את תיבת המייל.
                </p>
                <button type="button" className="btn btn-ghost" onClick={switchToLogin} style={{ marginTop: 8 }}>
                  חזרה למסך כניסה
                </button>
              </>
            ) : (
              <form onSubmit={onResetSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
                  הזן/י את כתובת האימייל שאיתה נרשמת, ונשלח אליך קישור לאיפוס הסיסמה.
                </p>
                <div className="field">
                  <label htmlFor="reset-email">אימייל</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                {error && <div className="form-status err">{error}</div>}
                <button type="submit" className="btn btn-gold" disabled={loading}>
                  {loading ? "שולח..." : "שליחת קישור לאיפוס סיסמה"}
                </button>
                <button
                  type="button"
                  onClick={switchToLogin}
                  style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13.5, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                >
                  חזרה למסך כניסה
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
