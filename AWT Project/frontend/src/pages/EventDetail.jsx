import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setRegistering(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setMessage({ type: 'success', text: data.message || 'Registered successfully!' });
      // Update local remaining capacity if confirmed
      if (data.status === 'confirmed') {
        setEvent(prev => ({ ...prev, current_registrations: prev.current_registrations + 1 }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!event && message.type === 'error') return <div className="text-center py-20 text-red-500">{message.text}</div>;
  if (!event) return null;

  const isFull = event.current_registrations >= event.max_capacity;
  const isDeadLinePassed = new Date(event.registration_deadline) < new Date();

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl overflow-hidden"
      >
        {/* Banner Area (Stylized) */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/80 to-secondary/80 relative">
          {event.banner_url && (
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover mix-blend-overlay" />
          )}
          <div className="absolute bottom-4 left-6 flex gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold uppercase tracking-wider shadow-sm">
              {event.category}
            </span>
            {event.is_paid && (
              <span className="px-3 py-1 bg-accent/90 rounded-full text-black text-sm font-bold shadow-sm">
                ₹{event.price}
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">{event.title}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-8">
                {event.description}
              </p>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {event.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Tag size={12} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Sidebar Info */}
            <div className="md:w-80 flex-shrink-0">
              <div className="glass bg-white/5 p-6 rounded-2xl sticky top-24 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-foreground">Date & Time</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(event.start_datetime).toLocaleString()} <br/> to <br/> {new Date(event.end_datetime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-secondary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-foreground">Venue</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="text-accent mt-1 flex-shrink-0" size={20} />
                  <div className="w-full">
                    <h3 className="font-semibold text-foreground">Capacity</h3>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span>{event.current_registrations} Registered</span>
                      <span>{event.max_capacity} Total</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all ${isFull ? 'from-red-500 to-red-600' : ''}`} 
                        style={{ width: `${Math.min((event.current_registrations / event.max_capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {message.text && (
                  <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>{message.text}</p>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/10">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleRegister}
                    disabled={registering || isDeadLinePassed || event.status !== 'published'}
                  >
                    {registering ? 'Processing...' : 
                     isDeadLinePassed ? 'Registration Closed' : 
                     isFull ? 'Join Waitlist' : 'Register Now'}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-3">
                    Deadline: {new Date(event.registration_deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetail;
