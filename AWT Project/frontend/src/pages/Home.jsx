import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Users, Zap, Star } from 'lucide-react';

const FloatingElement = ({ children, delay = 0, yOffset = 20, duration = 3 }) => {
    return (
        <motion.div
            animate={{ y: [0, yOffset, 0] }}
            transition={{
                repeat: Infinity,
                duration,
                ease: "easeInOut",
                delay
            }}
        >
            {children}
        </motion.div>
    );
}

const FeatureSection = ({ title, description, icon: Icon, reversed = false }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 py-24`}>
            <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: reversed ? 50 : -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reversed ? 50 : -50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                    <Icon size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4">{title}</h3>
                <p className="text-lg text-neutral-400 leading-relaxed">{description}</p>
            </motion.div>
            <motion.div
                className="flex-1 w-full relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
                <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-neutral-900 border border-white/10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Abstract geometric shapes for visual interest instead of plain images */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <FloatingElement duration={4}>
                            <div className="w-32 h-32 rounded-full bg-indigo-500/30 blur-2xl absolute -top-10 -left-10" />
                        </FloatingElement>
                        <FloatingElement duration={5} delay={1}>
                            <div className="w-40 h-40 rounded-full bg-purple-500/20 blur-2xl absolute top-10 right-10" />
                        </FloatingElement>
                        <div className="relative z-10 p-8 bg-neutral-950/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                            <Icon size={48} className="text-white/80" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Home = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

    // Custom springs for smoother parallax
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const headerY = useTransform(smoothProgress, [0, 1], ["0%", "50%"]);
    const headerOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
    const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);

    return (
        <div ref={containerRef} className="relative bg-neutral-950 min-h-[200vh] overflow-hidden">

            {/* Dynamic Background */}
            <motion.div
                className="fixed inset-0 z-0 pointer-events-none opacity-50"
                style={{ y: backgroundY }}
            >
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-purple-600/20 blur-[100px]" />
            </motion.div>

            {/* Hero Section */}
            <div className="relative z-10 h-screen flex flex-col items-center justify-center px-6">
                <motion.div
                    style={{ y: headerY, opacity: headerOpacity }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40">
                            Experience Campus <br /> Like Never Before.
                        </h1>
                    </motion.div>

                    <motion.p
                        className="text-xl md:text-2xl text-neutral-400 mb-10 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        An immersive platform to discover, join, and organize events that define your college journey.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/events" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform w-full sm:w-auto text-center flex items-center justify-center gap-2">
                            Explore Events <Zap size={18} />
                        </Link>
                        <Link to="/clubs" className="px-8 py-4 bg-white/10 text-white border border-white/20 font-bold rounded-full hover:bg-white/20 backdrop-blur-sm transition-all w-full sm:w-auto text-center">
                            Discover Clubs
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    style={{ opacity: headerOpacity }}
                >
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
                        <motion.div
                            className="w-1.5 h-1.5 bg-white rounded-full"
                            animate={{ y: [0, 16, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 bg-neutral-950/80 backdrop-blur-xl border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-24">

                    <FeatureSection
                        title="A Narrative Timeline"
                        description="Scroll through beautifully curated event cards. Every interaction feels alive. Stay updated with upcoming workshops, guest lectures, and festivals in a sequential flow."
                        icon={Calendar}
                    />

                    <FeatureSection
                        title="Thriving Communities"
                        description="Find your tribe. Browse through various campus clubs, from coding and robotics to dance and debate. Get involved and shape your college experience."
                        icon={Users}
                        reversed={true}
                    />

                    <FeatureSection
                        title="Dynamic Progression"
                        description="No more refreshing pages. Content loads seamlessly as you navigate, providing a fluid, app-like experience on both desktop and mobile."
                        icon={Star}
                    />

                </div>
            </div>

        </div>
    );
};

export default Home;
