// Canonical ids for the 4 core service categories, shared across the
// gallery filter (GalleryClient.tsx), the service detail pages, and the
// quote-request form's pre-selection logic.
//
// Stage 3.1/3.2 of the 13-stage remediation plan: previously the quote
// form pre-selected a service by matching the *editable* service.title
// text from the database against a hardcoded Hebrew string — if an admin
// ever renamed a service in the panel (even by one word, e.g. "שער
// חשמלי" -> "שערים חשמליים"), the match would silently fail and the form
// would fall back to "בחרו שירות" with no error anywhere. A fixed id
// decoupled from the editable display text can't drift like that.
export type ServiceSlug = "electric-gates" | "aluminum-railings" | "pergolas" | "metal-partitions";

export const SERVICE_SLUG_LABELS: Record<ServiceSlug, string> = {
  "electric-gates": "שער חשמלי",
  "aluminum-railings": "מעקה אלומיניום",
  pergolas: "פרגולה",
  "metal-partitions": "מחיצת מתכת",
};

export function isServiceSlug(value: string | undefined | null): value is ServiceSlug {
  return !!value && value in SERVICE_SLUG_LABELS;
}
