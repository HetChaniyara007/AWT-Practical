import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { StatusBadge, CategoryBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/events/${id}`, { withCredentials: true }),
      axios.get('/api/registrations/my', { withCredentials: true }),
    ]).then(([evRes, regRes]) => {
      setEvent(evRes.data.event);
      const alreadyReg = regRes.data.registrations.some((r) => r.event?._id === id);
      setRegistered(alreadyReg);
    }).catch(() => navigate('/events'))
    .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await axios.post('/api/registrations', { eventId: id }, { withCredentials: true });
      toast.success('🎫 Registered! Check My Tickets for your QR code.');
      setRegistered(true);
      setEvent((ev) => ({ ...ev, registrationCount: (ev.registrationCount || 0) + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!event) return null;

  const spotsLeft = event.capacity - (event.registrationCount || 0);
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);
  const canRegister = !registered && !deadlinePassed && spotsLeft > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        ← Back to Events
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {/* Banner */}
        <div className="relative h-56 bg-gradient-to-br from-primary-600/20 to-accent/20 flex items-end p-6">
          {event.banner && (
            <img src={event.banner} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800/90 to-transparent" />
          <div className="relative flex flex-wrap gap-2">
            <CategoryBadge category={event.category} />
            <StatusBadge status={event.status} />
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Details */}
            <div className="flex-1">
              {event.club && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300">
                    {event.club.name[0]}
                  </div>
                  <span className="text-sm text-slate-400 font-medium">{event.club.name}</span>
                </div>
              )}
              <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">{event.title}</h1>
              <p className="text-slate-400 mt-4 leading-relaxed">{event.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {[
                  { icon: '📅', label: 'Start', value: fmt(event.startDateTime) },
                  { icon: '🏁', label: 'End',   value: fmt(event.endDateTime) },
                  { icon: '📍', label: 'Venue', value: event.venue },
                  { icon: '⏳', label: 'Register by', value: fmt(event.registrationDeadline) },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="glass-card p-3">
                    <p className="text-xs text-slate-500 mb-1">{icon} {label}</p>
                    <p className="text-sm text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>

              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-400">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Registration card */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Capacity</span>
                  <span className="text-white font-semibold">{event.capacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Registered</span>
                  <span className="text-white font-semibold">{event.registrationCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Spots left</span>
                  <span className={`font-bold ${spotsLeft <= 0 ? 'text-red-400' : spotsLeft <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {Math.max(0, spotsLeft)}
                  </span>
                </div>

                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((event.registrationCount || 0) / event.capacity) * 100)}%` }}
                  />
                </div>

                <div className="pt-2">
                  {registered ? (
                    <div className="text-center py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                      <p className="text-emerald-400 font-semibold">✓ You're Registered!</p>
                      <p className="text-xs text-slate-500 mt-1">Check My Tickets for QR</p>
                    </div>
                  ) : deadlinePassed ? (
                    <div className="text-center py-3 rounded-xl bg-red-500/10 border border-red-500/25">
                      <p className="text-red-400 font-semibold">Registration Closed</p>
                    </div>
                  ) : spotsLeft <= 0 ? (
                    <div className="text-center py-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                      <p className="text-amber-400 font-semibold">Event Full</p>
                    </div>
                  ) : (
                    <button
                      id="btn-register"
                      onClick={handleRegister} disabled={registering}
                      className="btn-primary w-full"
                    >
                      {registering ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering…</>
                      ) : '🎫 Register Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
