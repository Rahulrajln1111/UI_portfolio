'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingAnimation() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove loading animation after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-background flex items-center justify-center z-50"
        >
          <div className="relative">
            {/* Animated flask with liquid */}
            <motion.div
              className="w-24 h-32 bg-primary/10 rounded-b-3xl relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Liquid animation */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-primary/30"
                initial={{ height: '20%' }}
                animate={{ 
                  height: ['20%', '80%', '20%'],
                  backgroundColor: [
                    'hsl(var(--primary) / 0.3)',
                    'hsl(var(--chart-2) / 0.3)',
                    'hsl(var(--primary) / 0.3)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Bubbles */}
              <motion.div
                className="absolute bottom-2 left-1/4 w-2 h-2 rounded-full bg-primary/40"
                animate={{
                  y: [0, -40, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.2
                }}
              />
              <motion.div
                className="absolute bottom-2 left-2/4 w-2 h-2 rounded-full bg-primary/40"
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
            </motion.div>
            
            {/* Flask neck */}
            <div className="w-8 h-4 bg-primary/10 mx-auto -mt-1 rounded-t-lg" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}