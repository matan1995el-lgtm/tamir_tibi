export default function ServicesLoading() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">מה אנחנו עושים</span>
          <h1>שירותים מקצה לקצה</h1>
          <p>מתכנון ראשוני ובחירת חומרים, דרך ייצור מדויק ועד התקנה ותחזוקה שוטפת.</p>
        </div>
      </section>

      <section className="section services">
        <div className="container">
          <div className="svc-grid" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="svc-card" key={i} style={{ transform: "none" }}>
                <div className="askeleton" style={{ width: 58, height: 58, borderRadius: "50%", marginBottom: 24 }} />
                <div className="askeleton" style={{ width: "70%", height: 19, marginBottom: 12 }} />
                <div className="askeleton" style={{ width: "100%", height: 13, marginBottom: 8 }} />
                <div className="askeleton" style={{ width: "85%", height: 13, marginBottom: 18 }} />
                <div className="askeleton" style={{ width: 100, height: 13 }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
