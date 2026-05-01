function RoleBadge({ role }) {
  const styles =
    role === "client"
      ? "bg-sky-500/15 text-sky-300 border-sky-500/20"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles}`}>
      {role}
    </span>
  );
}

export default RoleBadge;

