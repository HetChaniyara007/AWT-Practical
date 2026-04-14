const statusConfig = {
  pending:   { label: 'Pending',   class: 'badge-pending' },
  approved:  { label: 'Approved',  class: 'badge-approved' },
  rejected:  { label: 'Rejected',  class: 'badge-rejected' },
  cancelled: { label: 'Cancelled', class: 'badge-cancelled' },
  draft:     { label: 'Draft',     class: 'badge-draft' },
};

const categoryConfig = {
  technical:  { label: 'Technical',  color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  cultural:   { label: 'Cultural',   color: 'bg-pink-500/15 text-pink-400 border-pink-500/25' },
  sports:     { label: 'Sports',     color: 'bg-green-500/15 text-green-400 border-green-500/25' },
  workshop:   { label: 'Workshop',   color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  seminar:    { label: 'Seminar',    color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  other:      { label: 'Other',      color: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`badge ${cfg.class}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const cfg = categoryConfig[category] || categoryConfig.other;
  return (
    <span className={`badge border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const roleMap = {
    superadmin: { label: 'Superadmin', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    club_admin: { label: 'Club Admin', color: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
    student:    { label: 'Student',    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  };
  const cfg = roleMap[role] || roleMap.student;
  return <span className={`badge border ${cfg.color}`}>{cfg.label}</span>;
}
