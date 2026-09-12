// Shared guard for any href an admin can type freely into the CMS (nav
// menu links, content-block buttons) and that later renders as a real
// `<a href>`/`<Link href>` on the public site for every visitor. Without
// this, an admin account (even a non-owner role, or one whose password
// leaks) could store `javascript:alert(1)` or similar and it would
// execute in every visitor's browser on click — a stored-XSS path.
//
// The allowlist is deliberately permissive for what a legitimate site
// link actually looks like: an internal path ("/gallery", "#pricing"),
// a full http(s) URL, or a mailto:/tel: link — and rejects everything
// else that carries an explicit URI scheme (javascript:, data:, vbscript:,
// file:, and so on).

const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

// Matches a leading URI scheme per RFC 3986 (letters/digits/+/-/. then a
// colon), e.g. "javascript:", "https:", "tel:". Left untouched, a value
// with no such prefix is a relative/in-page link and is always safe.
const SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

export function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  const match = trimmed.match(SCHEME_RE);
  if (!match) return true; // relative path, "#anchor", "?query", or plain text
  return SAFE_SCHEMES.has(match[1].toLowerCase());
}

/**
 * Render-time defense in depth: returns the href unchanged if safe, or
 * "#" (an inert same-page anchor, not a functional link) if not — so
 * even a row written before this check existed, or one edited directly
 * in the database, can never execute script on the public site.
 */
export function sanitizeHref(href: string | null | undefined): string {
  if (!href) return "#";
  return isSafeHref(href) ? href : "#";
}

/**
 * Checks every "button" content block (the admin page/blog block editor)
 * for an unsafe href before the page/post is saved. Returns the first
 * offending href, or null if every button block is safe — a page/post
 * body is otherwise plain heading/paragraph/image/spacer blocks with no
 * link surface, so this is the one spot content blocks need the check.
 */
export function findUnsafeBlockHref(blocks: { type: string; href?: string }[]): string | null {
  for (const b of blocks) {
    if (b.type === "button" && b.href && !isSafeHref(b.href)) return b.href;
  }
  return null;
}
