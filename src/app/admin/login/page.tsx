"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("אימייל או סיסמה שגויים.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <img src="/brand/symbol-white.png" alt="Metaline" />
          <span>Metaline</span>
        </div>
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
        </form>
      </div>
    </div>
  );
}
