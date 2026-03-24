import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';

const EventNode = ({ event, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const isEven = index % 2 === 0;

    return (
        <div ref={ref} className="relative flex items-center justify-between md:justify-normal w-full mb-24 group">

            {/* Timeline Center Line */}
            <div className="hidden md:absolute md:block left-1/2 -translate-x-1/2 top-0 bottom-[-6rem] w-px bg-white/10" />

            {/* Timeline Dot */}
            <div className="hidden md:absolute md:flex left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10 transition-transform duration-500 group-hover:scale-150" />

            {/* Content Card */}
            <motion.div
                className={`w-full md:w-[45%] ${isEven ? 'md:pr-12 md:text-right md:ml-0' : 'md:pl-12 md:ml-auto'}`}
                initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
                animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: isEven ? -50 : 50, y: 20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="relative p-6 rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                        <div className={`text-indigo-400 font-mono text-sm mb-2 font-bold ${isEven ? 'md:justify-end' : ''} flex items-center gap-2`}>
                            <Clock size={14} />
                            {new Date(event.date).toLocaleDateString()} {event.startTime && `• ${event.startTime}`}
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                        <p className="text-neutral-400 mb-4 line-clamp-3">{event.description}</p>

                        <div className={`flex flex-wrap gap-3 ${isEven ? 'md:justify-end' : ''}`}>
                            <div className="flex items-center gap-1 text-xs px-3 py-1 bg-neutral-800 rounded-full text-neutral-300 border border-white/5">
                                <MapPin size={12} /> {event.location}
                            </div>
                            <div className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/20">
                                {event.organizer || 'College Admin'}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mobile Dot */}
            <div className="absolute md:hidden left-0 top-8 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
            <div className="absolute md:hidden left-[3px] top-10 bottom-[-5rem] w-px bg-white/10" />

        </div>
    );
};

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-neutral-950 py-24"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black mb-6"
                    >
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Timeline</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-neutral-400 max-w-2xl mx-auto"
                    >
                        A narrative journey through our upcoming campus activities.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="relative max-w-4xl mx-auto">
                        {events.map((event, i) => (
                            <EventNode key={event._id || i} event={event} index={i} />
                        ))}
                        {events.length === 0 && (
                            <div className="text-center text-neutral-500 py-12">
                                No upcoming events found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Events;
