import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { QrCode, Calendar, Clock, MapPin } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/registrations/my-tickets');
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        }
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchTickets();
  }, [user]);

  if (!user) return <div className="p-20 text-center">Please login to view dashboard.</div>;

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-bold">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Welcome back, {user.name.split(' ')[0]}!</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="font-mono text-primary font-bold">{user.roll_number}</p>
          <p className="text-sm text-gray-500">{user.department} • Year {user.year}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold font-display mb-6 border-b border-gray-200 dark:border-white/10 pb-4">My Tickets</h2>
        
        {loading ? (
          <div className="text-center py-10">Loading tickets...</div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl overflow-hidden relative group"
              >
                {/* Decorative status strip */}
                <div className={`absolute top-0 left-0 w-full h-1 ${ticket.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display font-bold text-xl truncate pr-4">{ticket.event_id.title}</h3>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      ticket.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary" />
                      <span>{new Date(ticket.event_id.start_datetime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      <span>{new Date(ticket.event_id.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      <span className="truncate">{ticket.event_id.venue}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-6 flex flex-col items-center">
                    {ticket.status === 'confirmed' ? (
                      <>
                        <div className="bg-white p-2 rounded-xl mb-3">
                          <img src={ticket.qr_code_url} alt="QR Code" className="w-24 h-24" />
                        </div>
                        <p className="font-mono text-xs tracking-widest text-gray-500">{ticket.ticket_id}</p>
                      </>
                    ) : (
                      <div className="py-6 flex flex-col items-center text-gray-500">
                        <QrCode size={40} className="mb-2 opacity-50" />
                        <p className="text-sm">QR Code unavailable</p>
                        <p className="text-xs">You are on the waitlist</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass p-12 text-center rounded-3xl">
            <h3 className="text-xl font-display text-gray-500 mb-3">No tickets yet</h3>
            <p className="text-gray-400 mb-6">You haven't registered for any events.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
