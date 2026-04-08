import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass border-t border-gray-200 dark:border-white/10 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                Event<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Empowering college communities through epic events.
            </p>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <Link to="/about" className="text-gray-500 hover:text-primary transition-colors">About Us</Link>
            <Link to="/events" className="text-gray-500 hover:text-primary transition-colors">All Events</Link>
            <span className="text-gray-500">© {new Date().getFullYear()} College EventHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
