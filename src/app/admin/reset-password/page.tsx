"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

// Reached from the "reset your password" email link. @supabase/ssr's
// browser client auto-detects the one-time code in the URL and exchanges
// it for a real (recovery) session on load — this page just waits for
// that, then lets the admin set a new password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setLinkInvalid(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setLinkInvalid(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("הסיסמה חייבת להכיל לפחות 8 תווים.");
      return;
    }
    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("לא ניתן היה לעדכן את הסיסמה. נסה/י לבקש קישור חדש.");
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <img src="/brand/symbol-white.png" alt="Metaline" />
          <span>Metaline</span>
        </div>

        <h1>בחירת סיסמה חדשה</h1>

        {linkInvalid ? (
          <>
            <p style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.6 }}>
              קישור האיפוס אינו תקף או שפג תוקפו. אפשר לבקש קישור חדש ממסך הכניסה.
            </p>
            <a href="/admin/login" className="btn btn-ghost" style={{ marginTop: 8, textAlign: "center" }}>
              חזרה למסך כניסה
            </a>
          </>
        ) : done ? (
          <p style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.6 }}>
            הסיסמה עודכנה בהצלחה. מעביר/ה אותך לפאנל הניהול...
          </p>
        ) : !ready ? (
          <p style={{ fontSize: 14.5, color: "var(--muted)" }}>מאמת/ת קישור...</p>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="new-password">סיסמה חדשה</label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label htmlFor="confirm-password">אימות סיסמה</label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {error && <div className="form-status err">{error}</div>}
            <button type="submit" className="btn btn-gold" disabled={loading}>
              {loading ? "מעדכן..." : "עדכון סיסמה"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
