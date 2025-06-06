'use client';

import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

export default function OpenToBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 dark:bg-green-500/20 px-4 py-2 rounded-full font-medium"
    >
      <Briefcase size={18} className="animate-pulse" />
      <span>Open to Work</span>
    </motion.div>
  );
}