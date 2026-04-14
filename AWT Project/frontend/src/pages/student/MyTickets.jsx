import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import QRTicket from '../../components/qr/QRTicket';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MyTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchRegistrations = () => {
    axios.get('/api/registrations/my', { withCredentials: true })
      .then((res) => setRegistrations(res.data.registrations))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleCancel = async (regId) => {
    if (!confirm('Cancel this registration?')) return;
    setCancelling(regId);
    try {
      await axios.delete(`/api/registrations/${regId}`, { withCredentials: true });
      toast.success('Registration cancelled.');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed.');
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = registrations.filter((r) => r.event?.status === 'approved' && new Date(r.event?.startDateTime) >= new Date());
  const past = registrations.filter((r) => r.event?.status !== 'approved' || new Date(r.event?.startDateTime) < new Date());

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">My Tickets</h1>
        <p className="page-subtitle">{registrations.length} total registrations</p>
      </div>

      {registrations.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">🎫</p>
          <p className="text-xl font-semibold text-white mb-2">No tickets yet</p>
          <p className="text-slate-400">Browse events and register to see your QR tickets here.</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-4">Upcoming ({upcoming.length})</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {upcoming.map((reg, i) => (
                  <motion.div key={reg._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <QRTicket registration={reg} />
                    {!reg.checkedIn && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleCancel(reg._id)}
                          disabled={cancelling === reg._id}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          {cancelling === reg._id ? 'Cancelling…' : 'Cancel registration'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-400 mb-4">Past / Other ({past.length})</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 opacity-60">
                {past.map((reg, i) => (
                  <motion.div key={reg._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <QRTicket registration={reg} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
