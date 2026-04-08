import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'super_admin' && user.role !== 'club_admin') {
      navigate('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    
    // In a real app, club_admins might have a different specific endpoint
    if (user?.role === 'super_admin') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  if (!user || loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-bold">Admin Portal</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">System Management & Analytics</p>
      </div>

      {user.role === 'super_admin' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-6 rounded-3xl flex items-center gap-6 border-l-4 border-primary">
            <div className="bg-primary/20 p-4 rounded-2xl"><Users size={32} className="text-primary" /></div>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Users</p>
              <h3 className="text-4xl font-display font-bold mt-1">{stats.totalUsers}</h3>
            </div>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-3xl flex items-center gap-6 border-l-4 border-secondary">
            <div className="bg-secondary/20 p-4 rounded-2xl"><Calendar size={32} className="text-secondary" /></div>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Events</p>
              <h3 className="text-4xl font-display font-bold mt-1">{stats.totalEvents}</h3>
            </div>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-3xl flex items-center gap-6 border-l-4 border-accent">
            <div className="bg-accent/20 p-4 rounded-2xl"><CheckCircle size={32} className="text-accent" /></div>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Registrations</p>
              <h3 className="text-4xl font-display font-bold mt-1">{stats.totalRegistrations}</h3>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl">
          <h2 className="text-2xl font-display font-bold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/events/create" className="block w-full text-center py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
              Create New Event
            </Link>
            <button className="block w-full text-center py-4 rounded-xl glass-hover font-medium">
              Manage Existing Events
            </button>
            {user.role === 'super_admin' && (
              <button className="block w-full text-center py-4 rounded-xl glass-hover font-medium">
                Manage Users
              </button>
            )}
          </div>
        </div>
        
        <div className="glass p-8 rounded-3xl">
          <h2 className="text-2xl font-display font-bold mb-4">Recent Activity</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
            <p className="text-gray-500">Activity stream coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
