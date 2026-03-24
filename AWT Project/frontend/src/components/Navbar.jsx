import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/50"
        >
            <Link to="/" className="text-xl font-bold tracking-tighter">Campus<span className="text-indigo-400">Events</span></Link>
            <div className="flex items-center gap-6 text-sm font-medium">
                <Link to="/events" className="hover:text-indigo-300 transition-colors">Events</Link>
                <Link to="/clubs" className="hover:text-indigo-300 transition-colors">Clubs</Link>
                <Link to="/login" className="hover:text-indigo-300 transition-colors">Log In</Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors font-bold">Sign Up</Link>
            </div>
        </motion.nav>
    );
};

export default Navbar;
