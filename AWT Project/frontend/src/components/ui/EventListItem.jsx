import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag } from 'lucide-react';
import Button from './Button';

const EventListItem = ({ event, delay = 0 }) => {
  const isPaid = event.is_paid;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="fluid-row group"
    >
      {/* Decorative side accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary"></div>

      <div className="flex-grow flex flex-col md:flex-row gap-4 md:items-center w-full">
        {event.banner_url && (
          <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden relative">
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none"></div>
          </div>
        )}

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wider">
              {event.category}
            </span>
            {isPaid && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-acid dark:text-accent uppercase tracking-wider">
                Paid
              </span>
            )}
            <h3 className="text-xl font-display font-bold text-foreground truncate ml-1">{event.title}</h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mt-1">
            {event.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-8 text-sm text-gray-600 dark:text-gray-300 hidden sm:flex">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-primary" />
            <span>{new Date(event.start_datetime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-secondary" />
            <span className="truncate max-w-[120px]">{event.venue}</span>
          </div>
          {event.club_id && (
            <div className="flex items-center gap-1.5">
              <Tag size={16} className="text-accent" />
              <span>{event.club_id.name || 'Club Event'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 w-full md:w-auto">
        <Link to={`/events/${event._id}`} className="block w-full">
          <Button variant="outline" className="w-full justify-between sm:justify-center group">
            <span>View Details</span>
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default EventListItem;
