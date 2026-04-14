import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, color = 'indigo', trend }) {
  const colors = {
    indigo: { bg: 'bg-primary-500/10', icon: 'text-primary-400', border: 'border-primary-500/20' },
    violet: { bg: 'bg-accent/10', icon: 'text-accent-light', border: 'border-accent/20' },
    cyan:   { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/20' },
    amber:  { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
    green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    red:    { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/20' },
  };
  const cfg = colors[color] || colors.indigo;

  return (
    <motion.div
      className="stat-card"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-lg ${cfg.icon}`}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
      </div>
    </motion.div>
  );
}
