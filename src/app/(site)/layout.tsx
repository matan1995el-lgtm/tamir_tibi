import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppFab from "@/components/WhatsAppFab";
import MobileCtaBar from "@/components/MobileCtaBar";
import AmbientGlow from "@/components/AmbientGlow";
import ScrollFX from "@/components/ScrollFX";
import Preloader from "@/components/Preloader";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import { QuoteModalProvider } from "@/components/QuoteModal";
import { formatContactFallback, getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <QuoteModalProvider contactFallback={formatContactFallback(settings)}>
      <Preloader />
      <ScrollFX />
      <AmbientGlow />
      <SiteHeader />
      {children}
      <SiteFooter settings={settings} />
      <WhatsAppFab whatsapp={settings.whatsapp} />
      <AccessibilityWidget />
      <MobileCtaBar phone={settings.phone} />
    </QuoteModalProvider>
  );
}
