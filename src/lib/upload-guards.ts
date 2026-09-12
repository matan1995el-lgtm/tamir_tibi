// Shared client-side guard applied before any admin image upload
// (gallery photos, page content images, site logo). The <input
// accept="image/*"> attribute is only a picker *hint* — a user can still
// select any file through "all files", drag-and-drop, or an OS file
// dialog override — so it enforces nothing on its own. This runs a real
// check just before the upload starts, with a specific, actionable
// Hebrew message instead of the generic "upload failed" toast that used
// to be the only feedback for an oversized or wrong-type file.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB — generous for a photo, small enough to fail fast on a mistaken upload

/** Returns an error message if the file should be rejected, or null if it's fine to upload. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "סוג קובץ לא נתמך — יש להעלות תמונה (JPG, PNG, WebP, GIF או SVG)";
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `הקובץ גדול מדי (${mb}MB) — הגודל המקסימלי הוא 8MB`;
  }
  return null;
}
