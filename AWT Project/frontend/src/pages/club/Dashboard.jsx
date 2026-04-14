import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function ClubDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/events/club/mine', { withCredentials: true })
      .then((res) => setEvents(res.data.events))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total:    events.length,
    pending:  events.filter((e) => e.status === 'pending').length,
    approved: events.filter((e) => e.status === 'approved').length,
    rejected: events.filter((e) => e.status === 'rejected').length,
    totalReg: events.reduce((sum, e) => sum + (e.registrationCount || 0), 0),
  };

  const recent = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Club Dashboard</h1>
          <p className="page-subtitle">{user?.clubRef?.name || 'Your Club'}</p>
        </div>
        <Link to="/club/events/new" className="btn-primary">+ New Event</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon="📅" label="Total Events" value={counts.total} color="indigo" />
        <StatCard icon="⏳" label="Pending"      value={counts.pending} color="amber" />
        <StatCard icon="✅" label="Approved"     value={counts.approved} color="green" />
        <StatCard icon="❌" label="Rejected"     value={counts.rejected} color="red" />
        <StatCard icon="👥" label="Total Registrations" value={counts.totalReg} color="cyan" />
      </div>

      {/* Recent Events */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Recent Events</h2>
          <Link to="/club/events" className="text-sm text-primary-400 hover:text-primary-300">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400 mb-4">No events yet.</p>
            <Link to="/club/events/new" className="btn-primary text-sm">Create your first event</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Registrations</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((ev) => (
                <motion.tr key={ev._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="font-medium text-white max-w-xs truncate">{ev.title}</td>
                  <td>{fmt(ev.startDateTime)}</td>
                  <td>
                    <span className="text-primary-400 font-semibold">{ev.registrationCount || 0}</span>
                    <span className="text-slate-600"> / {ev.capacity}</span>
                  </td>
                  <td><StatusBadge status={ev.status} /></td>
                  <td>
                    <Link to={`/club/events/${ev._id}/attendees`} className="text-xs text-primary-400 hover:text-primary-300 mr-3">
                      Attendees
                    </Link>
                    {['pending', 'draft', 'rejected'].includes(ev.status) && (
                      <Link to={`/club/events/${ev._id}/edit`} className="text-xs text-slate-400 hover:text-white">
                        Edit
                      </Link>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick tips */}
      {counts.pending > 0 && (
        <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
          <span className="text-2xl mt-0.5">⏳</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">{counts.pending} event{counts.pending > 1 ? 's' : ''} awaiting approval</p>
            <p className="text-slate-400 text-xs mt-0.5">The department will review your submission soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
