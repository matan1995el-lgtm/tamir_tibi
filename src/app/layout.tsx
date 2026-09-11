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
import "./globals.css";

export const metadata: Metadata = {
  title: "Metaline — פתרונות אלומיניום ומתכת ברמה אחרת",
  description:
    "Metaline מתמחה בייצור והתקנה של שערים חשמליים, מעקות אלומיניום, פרגולות ומחיצות מתכת בגימור פרימיום. עבודה מדויקת, חומרים איכותיים, ליווי מקצועי מהתכנון ועד ההתקנה.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
