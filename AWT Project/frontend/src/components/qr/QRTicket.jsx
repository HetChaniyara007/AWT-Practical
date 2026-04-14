import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';
import { motion } from 'framer-motion';

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export default function QRTicket({ registration }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!registration?.qrToken || !canvasRef.current) return;
    QRCodeLib.toCanvas(canvasRef.current, registration.qrToken, {
      width: 180,
      margin: 1,
      color: { dark: '#1a1a3e', light: '#ffffff' },
    }).catch((e) => setError(e.message));
  }, [registration?.qrToken]);

  const event = registration?.event;
  const statusColors = {
    true:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    false: 'bg-primary-500/15 text-primary-400 border-primary-500/25',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card overflow-hidden"
    >
      {/* Top banner */}
      <div className="relative h-24 bg-gradient-to-r from-primary-600/30 via-accent/20 to-cyber/20 p-4 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-primary-300 uppercase tracking-wider">E-Ticket</span>
            <span className={`badge border ${statusColors[registration?.checkedIn]}`}>
              {registration?.checkedIn ? '✓ Checked In' : 'Not Scanned'}
            </span>
          </div>
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{event?.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex gap-4">
        {/* QR Code */}
        <div className="flex-shrink-0 p-2 bg-white rounded-xl shadow-md">
          {error ? (
            <div className="w-[120px] h-[120px] flex items-center justify-center text-xs text-gray-500">QR Error</div>
          ) : (
            <canvas ref={canvasRef} className="rounded-md" style={{ width: 120, height: 120 }} />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2 min-w-0">
          <div>
            <p className="text-xs text-slate-500">Club</p>
            <p className="text-sm font-medium text-white truncate">{event?.club?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Date & Time</p>
            <p className="text-sm font-medium text-white">{formatDate(event?.startDateTime)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Venue</p>
            <p className="text-sm font-medium text-white truncate">{event?.venue}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Token</p>
            <p className="text-xs font-mono text-primary-400 truncate">{registration?.qrToken?.slice(0, 18)}...</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3">
        <div className="border-t border-dashed border-white/10 pt-3 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            Registered: {registration?.registeredAt ? new Date(registration.registeredAt).toLocaleDateString() : '—'}
          </span>
          {registration?.checkedIn && registration?.checkedInAt && (
            <span className="text-xs text-emerald-500">
              Checked in: {formatDate(registration.checkedInAt)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
