import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CategoryBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function ApprovalQueue() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    axios.get('/api/admin/events/pending', { withCredentials: true })
      .then((res) => setEvents(res.data.events))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/admin/events/${id}/approve`, {}, { withCredentials: true });
      toast.success('✅ Event approved and published!');
      setSelected(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return toast.error('Please provide a rejection reason.');
    setActionLoading(true);
    try {
      await axios.put(`/api/admin/events/${rejectModal._id}/reject`, { reason }, { withCredentials: true });
      toast.success('Event rejected. Club admin has been notified.');
      setRejectModal(null);
      setReason('');
      setSelected(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Approval Queue</h1>
        <p className="page-subtitle">
          {events.length > 0
            ? <><span className="text-amber-400 font-semibold">{events.length}</span> event{events.length > 1 ? 's' : ''} pending review</>
            : 'All caught up!'}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-xl font-semibold text-white mb-2">No pending events</p>
          <p className="text-slate-400">All event requests have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnimatePresence>
            {events.map((ev, i) => (
              <motion.div
                key={ev._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Banner */}
                <div className="relative h-32 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 flex items-end">
                  {ev.banner && (
                    <img src={ev.banner} alt={ev.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 to-transparent" />
                  <div className="relative flex items-center gap-2">
                    <span className="badge badge-pending">⏳ Pending</span>
                    <CategoryBadge category={ev.category} />
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300">
                      {ev.club?.name?.[0]}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{ev.club?.name}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-600">by {ev.createdBy?.name}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-1">{ev.title}</h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{ev.description}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500">
                    <div>📅 {fmt(ev.startDateTime)}</div>
                    <div>📍 {ev.venue}</div>
                    <div>👥 Capacity: {ev.capacity}</div>
                    <div>⏳ Deadline: {fmt(ev.registrationDeadline)}</div>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <button
                      id={`btn-approve-${ev._id}`}
                      onClick={() => handleApprove(ev._id)}
                      disabled={actionLoading}
                      className="btn-success flex-1 text-sm"
                    >
                      {actionLoading ? '…' : '✓ Approve'}
                    </button>
                    <button
                      id={`btn-reject-${ev._id}`}
                      onClick={() => setRejectModal(ev)}
                      disabled={actionLoading}
                      className="btn-danger flex-1 text-sm"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Rejection Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setReason(''); }} title="Reject Event">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Rejecting: <span className="text-white font-medium">{rejectModal?.title}</span>
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Rejection Reason *</label>
            <textarea
              id="input-reject-reason"
              value={reason} onChange={(e) => setReason(e.target.value)}
              rows={4} placeholder="Explain why this event is being rejected so the club can resubmit…"
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setRejectModal(null); setReason(''); }} className="btn-secondary">Cancel</button>
            <button id="btn-confirm-reject" onClick={handleReject} disabled={actionLoading} className="btn-danger">
              {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
