import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-2.81A2 2 0 0118 12.5V9a6 6 0 10-12 0v3.5a2 2 0 01-.595 1.69L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const TimeAgo = ({ date }) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <span>Just now</span>;
  if (mins < 60) return <span>{mins}m ago</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span>{hrs}h ago</span>;
  return <span>{Math.floor(hrs / 24)}d ago</span>;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all/mark', {}, { withCredentials: true });
      markAllRead();
    } catch (err) { /* silent */ }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleLabel = { student: 'Student', club_admin: 'Club Admin', superadmin: 'Superadmin' };
  const roleColor = { student: 'text-cyber', club_admin: 'text-accent', superadmin: 'text-amber-400' };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-dark-900/80 backdrop-blur-md z-20">
      {/* Left — breadcrumb / title */}
      <div className="flex items-center gap-3">
        <div className="w-px h-6 bg-white/10 hidden md:block" />
        <span className="text-sm text-slate-400 hidden md:block">
          Welcome back, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span>
        </span>
      </div>

      {/* Right — notifications + profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            id="btn-notifications"
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full notif-dot" />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 glass-card shadow-card-hover z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="font-semibold text-sm text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-primary-400 hover:text-primary-300">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-500 py-8 text-sm">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n, i) => (
                      <div key={i} className={`px-4 py-3 border-b border-white/4 hover:bg-white/3 transition-colors ${!n.read ? 'bg-primary-500/5' : ''}`}>
                        <p className="text-sm text-white font-medium">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-slate-600 mt-1"><TimeAgo date={n.createdAt} /></p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            id="btn-profile"
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
              <p className={`text-xs leading-tight ${roleColor[user?.role]}`}>{roleLabel[user?.role]}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-48 glass-card shadow-card-hover z-50 overflow-hidden py-1"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
