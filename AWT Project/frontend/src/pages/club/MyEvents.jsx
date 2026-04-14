import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { StatusBadge, CategoryBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchEvents = () => {
    setLoading(true);
    axios.get('/api/events/club/mine', { withCredentials: true })
      .then((res) => setEvents(res.data.events))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this event? This cannot be undone.')) return;
    setCancelling(id);
    try {
      await axios.delete(`/api/events/${id}`, { withCredentials: true });
      toast.success('Event cancelled.');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed.');
    } finally {
      setCancelling(null);
    }
  };

  const statuses = ['all', 'pending', 'approved', 'rejected', 'cancelled'];
  const filtered = filter === 'all' ? events : events.filter((e) => e.status === filter);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">My Events</h1>
          <p className="page-subtitle">{events.length} total events</p>
        </div>
        <Link to="/club/events/new" className="btn-primary">+ Create Event</Link>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s} id={`filter-${s}`}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filter === s ? 'bg-primary-500/20 text-primary-300 border-primary-500/40' : 'bg-white/3 text-slate-400 border-white/8 hover:text-slate-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-slate-600">
              ({s === 'all' ? events.length : events.filter((e) => e.status === s).length})
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400">No events found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Registrations</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <motion.tr key={ev._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="font-medium text-white">{ev.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{ev.venue}</div>
                  </td>
                  <td><CategoryBadge category={ev.category} /></td>
                  <td className="whitespace-nowrap">{fmt(ev.startDateTime)}</td>
                  <td>
                    <span className="text-primary-400 font-semibold">{ev.registrationCount || 0}</span>
                    <span className="text-slate-600"> / {ev.capacity}</span>
                  </td>
                  <td><StatusBadge status={ev.status} /></td>
                  <td>
                    <div className="flex items-center gap-3">
                      {ev.status === 'approved' && (
                        <Link to={`/club/events/${ev._id}/attendees`} className="text-xs text-cyber hover:text-cyan-300 font-medium">
                          Attendees
                        </Link>
                      )}
                      {['pending', 'draft', 'rejected'].includes(ev.status) && (
                        <Link to={`/club/events/${ev._id}/edit`} className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                          Edit
                        </Link>
                      )}
                      {ev.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(ev._id)}
                          disabled={cancelling === ev._id}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          {cancelling === ev._id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
