import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold group-hover:animate-pulse">
              E
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Event<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</Link>
            <Link to="/events" className="text-foreground hover:text-primary transition-colors font-medium">Events</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">About</Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-primary" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4 ml-4">
                <Link to={user.role === 'student' ? '/dashboard' : '/admin'} className="hidden md:flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <UserIcon size={18} />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                  <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
