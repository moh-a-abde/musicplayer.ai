'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration errors by only rendering animations on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animation variants for page transitions
  const variants = {
    hidden: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{ 
          type: 'spring', 
          stiffness: 250, 
          damping: 25,
          mass: 0.5
        }}
        className="min-h-screen flex flex-col pt-2"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 