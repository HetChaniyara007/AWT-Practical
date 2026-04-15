import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import EventCard from '../../components/events/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Home() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/events/upcoming', { withCredentials: true }),
      axios.get('/api/clubs', { withCredentials: true }),
    ]).then(([evRes, clRes]) => {
      setUpcoming(evRes.data.events);
      setClubs(clRes.data.clubs.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-8 lg:p-12"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.08) 100%), rgba(26,26,62,0.4)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/30 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/30 blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="border border-white/5 rounded-2xl absolute inset-0 pointer-events-none" />
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="badge badge-approved mb-4 inline-flex">🔴 Live Platform</span>
            <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight mb-3">
              Hello, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mb-6">
              Discover upcoming events, register with one click, and get your QR e-ticket instantly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/events" className="btn-primary">Browse Events →</Link>
              <Link to="/my-tickets" className="btn-secondary">My Tickets</Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
            <p className="text-slate-500 text-sm mt-0.5">Don't miss out — open for registration</p>
          </div>
          <Link to="/events" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-3">🎭</p>
            <p className="text-slate-400">No upcoming events right now. Check back soon!</p>
          </div>
        ) : (
          <motion.div
            variants={container} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {upcoming.map((event) => (
              <motion.div key={event._id} variants={item}>
                <EventCard event={event} linkTo={`/events/${event._id}`} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Clubs */}
      {clubs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-5">Active Clubs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {clubs.map((club, i) => (
              <motion.div
                key={club._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:border-primary-500/30 transition-colors cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent/20 border border-primary-500/20 flex items-center justify-center text-lg font-bold text-primary-300">
                  {club.name[0]}
                </div>
                <p className="text-xs font-medium text-slate-300 leading-tight line-clamp-2">{club.name}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
