import Link from "next/link";

// Root-level fallback for URLs that don't match any known route segment at
// all (an in-app 404 — e.g. a bad service slug — is handled by the richer
// (site)/not-found.tsx instead, with header/footer/quote modal included).
export default function RootNotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "var(--ink-0)" }}>
      <div className="container">
        <div className="notfound-inner">
          <div className="notfound-code">404</div>
          <h1>העמוד לא נמצא</h1>
          <p>הקישור שביקשתם לא קיים באתר.</p>
          <div className="notfound-actions">
            <Link href="/" className="btn btn-gold">
              חזרה לעמוד הבית
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
