// Shared client+server phone validation/normalization for the contact
// forms (stage 3.7 of the 13-stage remediation plan: "הוסף בדיקת טלפון
// בצד הלקוח ובשרת... ונרמל את המספר לפני שמירתו"). Accepts Israeli local
// format (05X-XXXXXXX, 0X-XXXXXXX), with or without spaces/dashes, and
// international format (+972... or 972...). Deliberately permissive on
// separators (people type phone numbers in all sorts of ways) but strict
// on the digit count, since that's what actually distinguishes a real
// number from a typo.

/** True if `raw` looks like a plausible phone number in Israeli local or
 * international format. Doesn't guarantee the number is real/reachable —
 * only that it's a shape worth accepting. */
export function isValidPhone(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  // Only digits, spaces, dashes, parentheses and one optional leading +.
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/[^\d]/g, "");
  if (trimmed.startsWith("+") || digits.startsWith("972")) {
    // International / +972 form: country code + 8-10 digit subscriber number.
    return digits.length >= 10 && digits.length <= 13;
  }
  // Israeli local form: 0 + area/mobile prefix + subscriber number.
  return digits.length === 9 || digits.length === 10;
}

/** Normalizes a validated phone number to a consistent +972 form for
 * storage, so the same visitor's number always looks the same in the
 * leads table regardless of how they typed it. Returns the input
 * unchanged (digits/plus only, no other cleanup) if it doesn't match a
 * recognized shape — callers should validate with `isValidPhone` first. */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("972")) return `+${digits}`;
  if (digits.startsWith("0")) return `+972${digits.slice(1)}`;
  return trimmed.replace(/[^\d+]/g, "");
}
