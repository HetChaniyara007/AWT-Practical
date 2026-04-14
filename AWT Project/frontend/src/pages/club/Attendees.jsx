import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import QRScanner from '../../components/qr/QRScanner';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function Attendees() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');

  const fetchData = () => {
    Promise.all([
      axios.get(`/api/events/${id}`, { withCredentials: true }),
      axios.get(`/api/registrations/event/${id}`, { withCredentials: true }),
    ]).then(([evRes, regRes]) => {
      setEvent(evRes.data.event);
      setRegistrations(regRes.data.registrations);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const checkedIn = registrations.filter((r) => r.checkedIn).length;

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Attendees</h1>
        <p className="page-subtitle">{event?.title}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Registered', value: registrations.length, color: 'text-primary-400' },
          { label: 'Checked In', value: checkedIn, color: 'text-emerald-400' },
          { label: 'Pending', value: registrations.length - checkedIn, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {['list', 'scanner'].map((tab) => (
          <button
            key={tab} id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === tab ? 'text-white bg-primary-500/10 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'list' ? '📋 Attendee List' : '📷 QR Scanner'}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div className="glass-card overflow-hidden">
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">👤</p>
              <p className="text-slate-400">No registrations yet.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Enrollment No.</th>
                  <th>Registered At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, i) => (
                  <motion.tr key={reg._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td className="text-slate-500">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300">
                          {reg.student?.name?.[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{reg.student?.name}</p>
                          <p className="text-xs text-slate-500">{reg.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-slate-400">{reg.student?.enrollmentNo || '—'}</td>
                    <td className="text-xs">{fmt(reg.registeredAt)}</td>
                    <td>
                      {reg.checkedIn ? (
                        <span className="badge badge-approved">✓ Checked In</span>
                      ) : (
                        <span className="badge badge-pending">Not Yet</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'scanner' && (
        <div className="max-w-md">
          <QRScanner onSuccess={() => setTimeout(fetchData, 500)} />
        </div>
      )}
    </div>
  );
}
