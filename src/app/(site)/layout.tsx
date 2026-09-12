import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppFab from "@/components/WhatsAppFab";
import MobileCtaBar from "@/components/MobileCtaBar";
import AmbientGlow from "@/components/AmbientGlow";
import ScrollFX from "@/components/ScrollFX";
import Preloader from "@/components/Preloader";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import { QuoteModalProvider } from "@/components/QuoteModal";
import { FONT_STACKS, formatContactFallback, getNavMenuItems, getSiteSettings, getSiteTheme } from "@/lib/site-data";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems, theme] = await Promise.all([getSiteSettings(), getNavMenuItems(), getSiteTheme()]);
  const fonts = FONT_STACKS[theme.font_pair];

  // Everything the admin's "עיצוב" screen controls (accent color, font
  // pair) is applied as CSS custom properties scoped to this wrapper —
  // never on :root — so it reaches every public page (all of it already
  // reads var(--gold)/var(--font-heading)/etc.) without ever touching the
  // admin panel, which renders under a completely separate layout/route
  // and keeps its own fixed look regardless of what the client picks here.
  const themeVars = {
    "--gold": theme.accent_color,
    "--gold-2": theme.accent_color_2,
    "--font-heading": fonts.heading,
    "--font-body": fonts.body,
  } as React.CSSProperties;

  return (
    <div className="site-themed" style={themeVars}>
      <QuoteModalProvider contactFallback={formatContactFallback(settings)}>
        <Preloader />
        <ScrollFX />
        <AmbientGlow />
        <SiteHeader
          navItems={navItems}
          logoUrl={settings.logo_url}
          facebookUrl={settings.facebook_url}
          instagramUrl={settings.instagram_url}
        />
        {children}
        <SiteFooter settings={settings} />
        <WhatsAppFab
          whatsapp={settings.whatsapp}
          phone={settings.phone}
          email={settings.email}
          facebookUrl={settings.facebook_url}
          instagramUrl={settings.instagram_url}
        />
        <AccessibilityWidget />
        <MobileCtaBar phone={settings.phone} />
      </QuoteModalProvider>
    </div>
  );
}
