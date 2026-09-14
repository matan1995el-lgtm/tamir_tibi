import type { NextConfig } from "next";

// Derived from the Supabase project URL rather than hardcoded, so this
// keeps working automatically if the project is ever migrated/recreated.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "zllogvcvfdzudthlsewt.supabase.co";

const nextConfig: NextConfig = {
  // Baseline security response headers (site-wide). Kept conservative —
  // no strict Content-Security-Policy here, since one would need careful
  // tuning against Next.js's own inline bootstrap scripts, the fonts
  // loaded in layout.tsx and the Supabase Storage image domain, and a
  // misconfigured CSP fails closed (breaks the page) rather than open.
  // These four are safe, well-understood defaults with no such risk.
  async headers() {
    // Report-Only CSP (stage 10.7 of the remediation plan: "בנה CSP לפי
    // המשאבים שהאתר באמת משתמש בהם. התחל בניטור לפני אכיפה"). Report-Only
    // never blocks anything — browsers just note what WOULD have been
    // blocked — so this is safe to ship without first watching real
    // traffic, unlike an enforcing CSP. Built from what the app actually
    // loads: self-hosted fonts (@fontsource, no Google Fonts CDN),
    // Supabase Storage for uploaded images, the admin panel's client-side
    // Supabase SDK calls (auth/storage/realtime), and the Formspree
    // notification POST from /api/contact. No report endpoint is
    // configured (none exists yet) so violations aren't collected
    // anywhere yet — this only proves the policy shape is right before
    // anyone considers making it enforcing.
    const csp = [
      "default-src 'self'",
      `img-src 'self' data: https://${supabaseHostname}`,
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      `connect-src 'self' https://${supabaseHostname} https://formspree.io`,
      "font-src 'self'",
      "frame-ancestors 'self'",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ];
  },
  images: {
    // Lets next/image optimize photos the admin panel uploads to Supabase
    // Storage (gallery projects, blog covers, about/homepage photo, a
    // custom logo) — those are public buckets served from this exact
    // path, so it's safe to scope the pattern this tightly rather than
    // allowing the whole supabase.co domain.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
