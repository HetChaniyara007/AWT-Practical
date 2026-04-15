import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-slate-400">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchAnalytics = () => {
    axios.get('/api/admin/analytics', { withCredentials: true })
      .then((res) => setAnalytics(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh dashboard on real-time events
    if (socket) {
      socket.on('event:approved', fetchAnalytics);
      socket.on('event:new_registration', fetchAnalytics);
      socket.on('checkin:update', fetchAnalytics);
      return () => {
        socket.off('event:approved', fetchAnalytics);
        socket.off('event:new_registration', fetchAnalytics);
        socket.off('checkin:update', fetchAnalytics);
      };
    }
  }, [socket]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const { overview, eventsByStatus, registrationsByMonth, topEvents, categoryDistribution } = analytics || {};

  // Registrations by month data for chart
  const regMonthData = (registrationsByMonth || []).map((m) => ({
    name: MONTHS[(m._id.month || 1) - 1],
    Registrations: m.count,
  }));

  // Status pie data
  const statusData = Object.entries(eventsByStatus || {}).map(([name, value]) => ({ name, value }));

  // Category bar data
  const categoryData = (categoryDistribution || []).map((c) => ({
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    Events: c.count,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Real-time platform overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🎭" label="Total Events"     value={overview?.totalEvents || 0}        color="indigo" />
        <StatCard icon="👤" label="Students"          value={overview?.totalUsers || 0}          color="cyan" />
        <StatCard icon="🎫" label="Registrations"     value={overview?.totalRegistrations || 0}  color="violet" />
        <StatCard icon="🏛️" label="Active Clubs"      value={overview?.totalClubs || 0}          color="amber" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations over time */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-5">Registrations Over Time</h3>
          {regMonthData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={regMonthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Registrations" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Event Status Pie */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-5">Events by Status</h3>
          {statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category distribution */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-5">Events by Category</h3>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Events" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top events */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-5">Top Events by Registration</h3>
          {(topEvents || []).length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No approved events yet</div>
          ) : (
            <div className="space-y-3">
              {(topEvents || []).map((ev, i) => (
                <motion.div key={ev._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: COLORS[i], color: '#fff' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                    <p className="text-xs text-slate-500">{ev.club?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary-400">{ev.registrationCount}</p>
                    <p className="text-xs text-slate-600">/ {ev.capacity}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
