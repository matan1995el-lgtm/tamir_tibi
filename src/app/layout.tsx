import type { Metadata } from "next";
import "@fontsource/rubik/latin-500.css";
import "@fontsource/rubik/latin-600.css";
import "@fontsource/rubik/latin-700.css";
import "@fontsource/rubik/latin-800.css";
import "@fontsource/rubik/hebrew-500.css";
import "@fontsource/rubik/hebrew-600.css";
import "@fontsource/rubik/hebrew-700.css";
import "@fontsource/rubik/hebrew-800.css";
import "@fontsource/heebo/latin-300.css";
import "@fontsource/heebo/latin-400.css";
import "@fontsource/heebo/latin-500.css";
import "@fontsource/heebo/latin-600.css";
import "@fontsource/heebo/latin-700.css";
import "@fontsource/heebo/hebrew-300.css";
import "@fontsource/heebo/hebrew-400.css";
import "@fontsource/heebo/hebrew-500.css";
import "@fontsource/heebo/hebrew-600.css";
import "@fontsource/heebo/hebrew-700.css";
// The site-wide font pair is chosen at runtime in the admin panel's
// "עיצוב" screen (a curated list, not free text — see FONT_STACKS in
// site-data.ts), so every option it can pick is loaded unconditionally
// here and the actual active one is just a CSS custom property swap.
import "@fontsource/assistant/latin-400.css";
import "@fontsource/assistant/latin-500.css";
import "@fontsource/assistant/latin-600.css";
import "@fontsource/assistant/latin-700.css";
import "@fontsource/assistant/latin-800.css";
import "@fontsource/assistant/hebrew-400.css";
import "@fontsource/assistant/hebrew-500.css";
import "@fontsource/assistant/hebrew-600.css";
import "@fontsource/assistant/hebrew-700.css";
import "@fontsource/assistant/hebrew-800.css";
import "@fontsource/secular-one/latin-400.css";
import "@fontsource/secular-one/hebrew-400.css";
import "./globals.css";

// NEXT_PUBLIC_SITE_URL should be set to the site's real production domain
// once one is assigned (see .env.example) — it's what makes shared-link
// previews (WhatsApp/Facebook/Google) resolve OG images and canonical URLs
// correctly. Falls back to a placeholder so the build never breaks without it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Metaline — פתרונות אלומיניום ומתכת ברמה אחרת",
    template: "%s | Metaline",
  },
  description:
    "Metaline מתמחה בייצור והתקנה של שערים חשמליים, מעקות אלומיניום, פרגולות ומחיצות מתכת בגימור פרימיום. עבודה מדויקת, חומרים איכותיים, ליווי מקצועי מהתכנון ועד ההתקנה.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
