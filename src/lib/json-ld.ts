/**
 * Safely serializes a JSON-LD object for embedding inside a
 * `<script type="application/ld+json" dangerouslySetInnerHTML>` tag.
 *
 * `JSON.stringify` alone does NOT escape "<" — if any field feeding the
 * object (an admin-editable service/blog title, excerpt, business name,
 * etc.) contains "</script>", it closes the script tag early and lets the
 * rest of the string be parsed as HTML, i.e. stored XSS reachable by any
 * admin role that can edit that field. Escaping "<" as the equivalent
 * unicode escape neutralizes that without changing the JSON-LD's meaning
 * (JSON string values may contain literal unicode escapes).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
