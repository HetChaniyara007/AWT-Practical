import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const Clubs = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/clubs')
            .then(res => res.json())
            .then(data => {
                setClubs(data);
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
                <div className="text-center mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black mb-6"
                    >
                        Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Communities</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-neutral-400 max-w-2xl mx-auto"
                    >
                        Find your tribe. Discover clubs that match your passions.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {clubs.map((club, i) => (
                            <motion.div
                                key={club._id || i}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="group relative p-8 rounded-3xl bg-neutral-900 border border-white/5 overflow-hidden transition-all duration-300"
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-emerald-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-emerald-500/10 transition-colors duration-500" />
                                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="text-5xl mb-6">{club.icon || '🎯'}</div>
                                    <h3 className="text-2xl font-bold mb-3">{club.name}</h3>
                                    <p className="text-neutral-400 flex-grow mb-6 leading-relaxed">
                                        {club.description}
                                    </p>
                                    <button className="mt-auto w-full py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!loading && clubs.length === 0 && (
                    <div className="text-center text-neutral-500 py-12">
                        No clubs found.
                    </div>
                )}

            </div>
        </motion.div>
    );
};

export default Clubs;
