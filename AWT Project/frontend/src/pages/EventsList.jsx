import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import EventListItem from '../components/ui/EventListItem';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let url = '/api/events?status=published';
        if (category) url += `&category=${category}`;
        if (searchTerm) url += `&search=${searchTerm}`;
        
        const res = await fetch(url);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };

    // Simple debounce
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, category]);

  const categories = ['cultural', 'technical', 'sports', 'workshop', 'other'];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Discover Events</h1>
        
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events by title, tag, or description..."
              className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0">
            <select
              className="w-full md:w-48 py-3 px-4 rounded-xl glass text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="text-gray-900">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Events Feed */}
      <div className="space-y-4 relative min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : events.length > 0 ? (
          events.map((event, index) => (
            <EventListItem key={event._id} event={event} delay={index * 0.05} />
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20 glass rounded-3xl"
          >
            <h3 className="text-2xl font-display text-gray-500 mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
