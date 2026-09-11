export default function AdminTopbar({ crumb, title }: { crumb: string; title: string }) {
  return (
    <div className="admin-topbar">
      <div>
        <div className="crumb">{crumb}</div>
        <h1>{title}</h1>
      </div>
    </div>
  );
}
