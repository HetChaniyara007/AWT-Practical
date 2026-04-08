import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass p-8 md:p-12 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            About EventHub
          </h1>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            <p>
              Welcome to the ultimate college experience platform. We built this space because 
              we were tired of missing out on epic hackathons, cultural nights, and workshops 
              just because a poster got buried on a notice board.
            </p>
            
            <p>
              <strong className="text-foreground font-semibold">Our Mission:</strong> To create an electrifying, 
              centralized hub where students can discover, register, and manage their college life effortlessly.
            </p>
            
            <p>
              Whether you're looking to dive into the next big coding marathon, secure your spot at the 
              dance battle, or just find out what the Robotics Club is up to this weekend, 
              EventHub has you covered with instant QR tickets, dynamic waitlists, and seamless club integration.
            </p>
            
            <div className="mt-10 pt-8 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500 font-bold">Built for</p>
                <p className="font-display text-xl mt-1 text-foreground">The Next Generation</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-xl">🚀</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
