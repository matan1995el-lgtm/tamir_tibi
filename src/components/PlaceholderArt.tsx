/**
 * Hand-drawn, brand-styled line-art illustrations used as stand-ins
 * wherever a real project photo hasn't been uploaded yet (gallery items
 * with no image_url, and the static homepage category tiles). These are
 * deliberately illustrations, not photos of stock "aluminum gates" —
 * nothing here should ever be mistaken for a real completed project, and
 * each one that represents an actual gallery entry is paired with a small
 * "הדמיה" (illustration) badge in GalleryClient so visitors always know
 * what they're looking at. Swap them out from the admin panel's gallery
 * manager by uploading a real photo — that automatically replaces the
 * illustration on the live tile.
 *
 * All four share the same visual language as the rest of the site: thin
 * gold strokes on a dark ground, echoing the corner-frame / ring-deco /
 * blueprint motifs already used around the 3D logo and section dividers.
 */

type ArtProps = { className?: string };

const STROKE = "#D4AF37";
const STROKE_DIM = "rgba(212,175,55,.55)";
const STROKE_FAINT = "rgba(212,175,55,.28)";

function ArtFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="artGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#232f3b" />
          <stop offset="1" stopColor="#141c23" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#artGround)" />
      {children}
    </svg>
  );
}

export function ArtElectricGate({ className }: ArtProps) {
  const bars = Array.from({ length: 9 }, (_, i) => 60 + i * 16);
  return (
    <ArtFrame className={className}>
      <line x1="20" y1="230" x2="380" y2="230" stroke={STROKE_DIM} strokeWidth="2" />
      <line x1="20" y1="236" x2="380" y2="236" stroke={STROKE_FAINT} strokeWidth="1" strokeDasharray="2 6" />
      {bars.map((x, i) => (
        <rect key={x} x={x} y={i % 2 === 0 ? 120 : 132} width="6" height={i % 2 === 0 ? 110 : 98} rx="2" fill="none" stroke={STROKE} strokeWidth="1.4" opacity={0.8} />
      ))}
      <rect x="44" y="150" width="26" height="70" rx="2" fill="none" stroke={STROKE_DIM} strokeWidth="1.4" />
      <circle cx="57" cy="230" r="7" fill="none" stroke={STROKE} strokeWidth="1.6" />
      <circle cx="330" cy="230" r="7" fill="none" stroke={STROKE} strokeWidth="1.6" />
      <path d="M110 210 h250" stroke={STROKE_FAINT} strokeWidth="1" strokeDasharray="1 8" />
      <rect x="300" y="96" width="34" height="26" rx="3" fill="none" stroke={STROKE_DIM} strokeWidth="1.4" />
      <circle cx="317" cy="109" r="4" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M317 105 v8 M313 109 h8" stroke={STROKE} strokeWidth="1" />
    </ArtFrame>
  );
}

export function ArtRailing({ className }: ArtProps) {
  const posts = [40, 110, 180, 250, 320];
  return (
    <ArtFrame className={className}>
      <line x1="20" y1="90" x2="380" y2="90" stroke={STROKE} strokeWidth="2.2" />
      <line x1="20" y1="96" x2="380" y2="96" stroke={STROKE_FAINT} strokeWidth="1" />
      {posts.map((x) => (
        <line key={x} x1={x} y1="90" x2={x} y2="230" stroke={STROKE_DIM} strokeWidth="2" />
      ))}
      {posts.slice(0, -1).map((x, i) => (
        <g key={x}>
          <rect x={x + 8} y={98} width={posts[i + 1] - x - 16} height="128" fill="rgba(212,175,55,.05)" stroke={STROKE_FAINT} strokeWidth="1" />
          <line x1={x + 14} y1="104" x2={posts[i + 1] - 14} y2="220" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
        </g>
      ))}
      <line x1="20" y1="230" x2="380" y2="230" stroke={STROKE_DIM} strokeWidth="2" />
    </ArtFrame>
  );
}

export function ArtPergola({ className }: ArtProps) {
  const slats = Array.from({ length: 10 }, (_, i) => 50 + i * 32);
  return (
    <ArtFrame className={className}>
      <g opacity="0.6">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={200} y1={40} x2={90 + i * 75} y2={10} stroke={STROKE_FAINT} strokeWidth="1" />
        ))}
      </g>
      {slats.map((x) => (
        <line key={x} x1={x} y1="60" x2={x - 20} y2="120" stroke={STROKE} strokeWidth="2" opacity="0.75" />
      ))}
      <line x1="20" y1="122" x2="380" y2="122" stroke={STROKE_DIM} strokeWidth="2.4" />
      <line x1="55" y1="122" x2="45" y2="250" stroke={STROKE_DIM} strokeWidth="3" />
      <line x1="345" y1="122" x2="355" y2="250" stroke={STROKE_DIM} strokeWidth="3" />
      <line x1="45" y1="250" x2="10" y2="250" stroke={STROKE_FAINT} strokeWidth="1.5" />
      <line x1="355" y1="250" x2="390" y2="250" stroke={STROKE_FAINT} strokeWidth="1.5" />
    </ArtFrame>
  );
}

export function ArtPartition({ className }: ArtProps) {
  const cols = [60, 140, 220, 300];
  const rows = [70, 150, 230];
  return (
    <ArtFrame className={className}>
      <rect x="30" y="50" width="340" height="200" rx="4" fill="none" stroke={STROKE_DIM} strokeWidth="2" />
      {cols.map((cx) =>
        rows.map((cy) => (
          <path
            key={`${cx}-${cy}`}
            d={`M${cx} ${cy - 26} L${cx + 26} ${cy} L${cx} ${cy + 26} L${cx - 26} ${cy} Z`}
            fill="rgba(212,175,55,.06)"
            stroke={STROKE}
            strokeWidth="1.3"
            opacity="0.8"
          />
        ))
      )}
    </ArtFrame>
  );
}

/**
 * Large, low-opacity backdrop used behind the hero copy — an abstract
 * blueprint-style gate silhouette, never meant to be consciously "seen",
 * just to give the hero some depth beyond flat gradients + particles.
 */
export function ArtHeroMotif({ className }: ArtProps) {
  const bars = Array.from({ length: 14 }, (_, i) => 40 + i * 24);
  return (
    <svg className={className} viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <circle cx="700" cy="140" r="220" fill="none" stroke="rgba(212,175,55,.14)" strokeWidth="1" />
      <circle cx="700" cy="140" r="280" fill="none" stroke="rgba(212,175,55,.08)" strokeWidth="1" />
      <line x1="0" y1="430" x2="900" y2="430" stroke="rgba(212,175,55,.16)" strokeWidth="1" />
      {bars.map((x, i) => (
        <line key={x} x1={x} y1={i % 2 === 0 ? 300 : 330} x2={x} y2="430" stroke="rgba(212,175,55,.14)" strokeWidth="1.2" />
      ))}
    </svg>
  );
}
