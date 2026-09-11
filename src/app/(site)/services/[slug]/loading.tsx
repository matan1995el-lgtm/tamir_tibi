export default function ServiceDetailLoading() {
  return (
    <section className="page-hero">
      <div className="container" aria-hidden="true">
        <div className="askeleton" style={{ width: 58, height: 58, borderRadius: "50%", marginBottom: 20 }} />
        <div className="askeleton" style={{ width: 140, height: 12, marginBottom: 16 }} />
        <div className="askeleton" style={{ width: "50%", height: 34, marginBottom: 16 }} />
        <div className="askeleton" style={{ width: "70%", height: 14, marginBottom: 8 }} />
        <div className="askeleton" style={{ width: "40%", height: 14, marginBottom: 28 }} />
        <div style={{ display: "flex", gap: 16 }}>
          <div className="askeleton" style={{ width: 150, height: 48 }} />
          <div className="askeleton" style={{ width: 170, height: 48 }} />
        </div>
      </div>
    </section>
  );
}
