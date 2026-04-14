import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const routes = { superadmin: '/admin/dashboard', club_admin: '/club/dashboard', student: '/' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: '👑 Superadmin', email: 'admin@college.edu', pass: 'Admin@123', color: 'amber' },
    { label: '🎓 Club Admin (Tech)', email: 'techclub@college.edu', pass: 'Club@123', color: 'violet' },
    { label: '🎓 Club Admin (Cultural)', email: 'cultural@college.edu', pass: 'Club@123', color: 'violet' },
    { label: '👤 Student', email: 'aanya@college.edu', pass: 'Student@123', color: 'cyan' },
  ];

  const fillDemo = (email, pass) => {
    setForm({ email, password: pass });
  };

  return (
    <div className="min-h-screen hero-gradient flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mb-8 shadow-glow-lg">
            <span className="text-white text-2xl font-bold">ES</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-4">
            EventSphere<span className="gradient-text">.</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-md">
            The complete event management platform for modern college campuses.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-sm">
            {[
              { icon: '🚀', label: 'Digital Approvals' },
              { icon: '🎫', label: 'QR E-Tickets' },
              { icon: '📊', label: 'Live Analytics' },
              { icon: '🔔', label: 'Real-time Alerts' },
            ].map((f) => (
              <div key={f.label} className="glass-card p-3 flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm font-medium text-slate-300">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
              <p className="text-slate-400 text-sm mt-1">Enter your credentials to access the platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <input
                  id="input-email"
                  type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="you@college.edu"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <input
                  id="input-password"
                  type="password" name="password" value={form.password} onChange={handleChange}
                  required placeholder="••••••••"
                  className="input-field"
                />
              </div>

              <button
                id="btn-login"
                type="submit" disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Register
              </Link>
            </p>

            {/* Demo accounts */}
            <div className="mt-6 border-t border-white/5 pt-6">
              <p className="text-xs text-slate-500 mb-3 text-center">Quick login with demo accounts:</p>
              <div className="space-y-2">
                {demoAccounts.map((a) => (
                  <button
                    key={a.email}
                    onClick={() => fillDemo(a.email, a.pass)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/3 hover:bg-white/6 transition-colors border border-white/5 flex items-center justify-between"
                  >
                    <span className="text-slate-300">{a.label}</span>
                    <span className="text-slate-500">{a.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
