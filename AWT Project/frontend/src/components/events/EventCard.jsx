import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatusBadge, CategoryBadge } from '../ui/Badge';

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function EventCard({ event, linkTo, showStatus = false }) {
  const spotsLeft = event.capacity - (event.registrationCount || 0);
  const isFull = spotsLeft <= 0;
  const fillPct = Math.min(100, ((event.registrationCount || 0) / event.capacity) * 100);

  const gradients = {
    technical: 'from-blue-600/20 to-indigo-600/20',
    cultural:  'from-pink-600/20 to-rose-600/20',
    sports:    'from-green-600/20 to-teal-600/20',
    workshop:  'from-purple-600/20 to-violet-600/20',
    seminar:   'from-amber-600/20 to-orange-600/20',
    other:     'from-slate-600/20 to-gray-600/20',
  };

  const card = (
    <motion.div
      className="glass-card overflow-hidden cursor-pointer group"
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Banner / Header */}
      <div className={`relative h-36 bg-gradient-to-br ${gradients[event.category] || gradients.other} flex items-end p-4 overflow-hidden`}>
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-2 right-2 w-24 h-24 rounded-full bg-white/5 blur-xl" />
            <div className="absolute bottom-2 left-2 w-16 h-16 rounded-full bg-white/5 blur-xl" />
          </div>
        )}
        <div className="relative flex items-end justify-between w-full">
          <CategoryBadge category={event.category} />
          {showStatus && <StatusBadge status={event.status} />}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Club */}
        {event.club && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-sm bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-400 text-[8px] font-bold">
                {event.club.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">{event.club.name}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
          {event.title}
        </h3>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarIcon />
            <span>{formatDate(event.startDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <LocationIcon />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-slate-500">
              <UsersIcon />
              <span>{event.registrationCount || 0} / {event.capacity}</span>
            </div>
            <span className={`font-medium ${isFull ? 'text-red-400' : spotsLeft <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isFull ? 'Full' : `${spotsLeft} spots left`}
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : fillPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (linkTo) return <Link to={linkTo}>{card}</Link>;
  return card;
}
