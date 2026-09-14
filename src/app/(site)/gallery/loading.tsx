export default function GalleryLoading() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">עבודות נבחרות</span>
          <h1>גלריית הפרויקטים שלנו</h1>
          <p>עיון בפרויקטים ובאפשרויות העיצוב שלנו לפי סוג — סננו לפי התחום שמעניין אתכם.</p>
        </div>
      </section>

      <section className="section gallery-t">
        <div className="container">
          <div className="gal-grid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="askeleton" style={{ aspectRatio: "4/5", borderRadius: 4 }} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
