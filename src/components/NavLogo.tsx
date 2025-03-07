import React from 'react';
import { motion } from 'framer-motion';

export function NavLogo() {
  // Text animation variants
  const textVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      }
    }
  };
  
  const letterVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };
  
  // Split the text into individual letters
  const text = "musicplayer.ai";
  const letters = Array.from(text);
  
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
      variants={textVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div 
        className="bg-gradient-to-r from-primary-600/90 via-primary-500/90 to-secondary-600/90 dark:from-primary-500/90 dark:via-primary-400/90 dark:to-secondary-500/90 text-white px-5 py-1.5 rounded-full text-sm font-medium flex backdrop-blur-md shadow-lg shadow-primary-500/20 dark:shadow-primary-900/30 border border-white/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          boxShadow: [
            "0 10px 25px -5px rgba(59, 130, 246, 0.2)",
            "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
            "0 10px 25px -5px rgba(59, 130, 246, 0.2)"
          ]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            variants={letterVariants}
            className="inline-block"
            style={{ 
              textShadow: "0 0 5px rgba(255, 255, 255, 0.5)"
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
} 