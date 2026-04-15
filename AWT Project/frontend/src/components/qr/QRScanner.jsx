import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRScanner({ onSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const startScanner = async () => {
    setError('');
    setResult(null);
    setScanning(true);

    try {
      html5QrRef.current = new Html5Qrcode('qr-reader');
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Stop scanning immediately
          await html5QrRef.current.stop();
          setScanning(false);
          // Process token
          await handleCheckin(decodedText);
        },
        (scanError) => { /* silent scan errors */ }
      );
    } catch (err) {
      setError('Camera access denied or not available. Please allow camera permissions.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch (_) {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { if (html5QrRef.current) html5QrRef.current.stop().catch(() => {}); };
  }, []);

  const handleCheckin = async (token) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/registrations/checkin', { qrToken: token }, { withCredentials: true });
      setResult({ success: true, ...res.data });
      toast.success(`✅ Check-in: ${res.data.student?.name}`);
      onSuccess?.(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(''); };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">QR Scanner</h3>
        <span className="badge badge-pending">Camera Check-in</span>
      </div>

      {/* Scanner view */}
      <div id="qr-reader" className={`rounded-xl overflow-hidden bg-dark-800 ${scanning ? 'block' : 'hidden'}`} style={{ minHeight: 300 }} />

      {/* Idle state */}
      {!scanning && !result && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm text-center">Point the camera at a student's QR ticket</p>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button id="btn-start-scanner" onClick={startScanner} className="btn-primary">
            Start Camera
          </button>
        </div>
      )}

      {/* Scanning indicator */}
      {scanning && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Scanning…
          </div>
          <button onClick={stopScanner} className="btn-secondary text-xs px-3 py-1.5">Stop</button>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl p-4 border ${result.success ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-red-500/10 border-red-500/25'}`}
          >
            {result.success ? (
              <>
                <p className="text-emerald-400 font-semibold text-sm">✅ Check-in Successful!</p>
                <p className="text-white font-medium mt-1">{result.student?.name}</p>
                <p className="text-slate-400 text-xs">{result.student?.enrollmentNo} · {result.student?.email}</p>
              </>
            ) : (
              <p className="text-red-400 text-sm">{result.message}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => { reset(); startScanner(); }} className="btn-success text-xs px-3 py-1.5">Scan Next</button>
              <button onClick={reset} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          Verifying ticket…
        </div>
      )}
    </div>
  );
}
