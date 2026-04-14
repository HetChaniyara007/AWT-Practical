import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import EventCard from '../../components/events/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CATEGORIES = ['all', 'technical', 'cultural', 'sports', 'workshop', 'seminar', 'other'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const LIMIT = 12;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (search) params.set('search', search);
    if (category !== 'all') params.set('category', category);

    axios.get(`/api/events?${params}`, { withCredentials: true })
      .then((res) => {
        setEvents(res.data.events);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleCategory = (cat) => { setCategory(cat); setPage(1); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Events</h1>
        <p className="page-subtitle">{total} approved events available</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="input-search"
            type="text" placeholder="Search events…" value={search} onChange={handleSearch}
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`btn-filter-${cat}`}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                category === cat
                  ? 'bg-primary-500/20 text-primary-300 border-primary-500/40'
                  : 'bg-white/3 text-slate-400 border-white/8 hover:border-white/15 hover:text-slate-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-400 text-lg">No events found for your search.</p>
          <button onClick={() => { setSearch(''); setCategory('all'); }} className="btn-secondary mt-4">Clear filters</button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {events.map((event, i) => (
            <motion.div key={event._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <EventCard event={event} linkTo={`/events/${event._id}`} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                p === page ? 'bg-primary-500 text-white shadow-glow' : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
