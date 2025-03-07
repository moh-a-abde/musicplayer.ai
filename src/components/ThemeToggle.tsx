"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Animation variants
  const iconVariants = {
    initial: { scale: 0.6, opacity: 0, rotate: -90 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: { scale: 0.6, opacity: 0, rotate: 90 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  };

  const backgroundVariants = {
    light: { 
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(229, 231, 235, 0.7)'
    },
    dark: { 
      backgroundColor: 'rgba(23, 23, 23, 0.7)',
      borderColor: 'rgba(64, 64, 64, 0.7)'
    }
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <div className="h-5 w-5 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      initial={false}
      animate={theme === "light" ? "light" : "dark"}
      variants={backgroundVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative h-10 w-10 rounded-full border backdrop-blur-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-sm"
    >
      {/* Sun and Moon hover background effect */}
      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div
            key="hover-effect"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`absolute inset-0 rounded-full ${
              theme === "light" 
                ? "bg-gradient-to-br from-amber-100/50 to-amber-200/50 dark:from-indigo-900/30 dark:to-indigo-800/30" 
                : "bg-gradient-to-br from-indigo-100/50 to-indigo-200/50 dark:from-indigo-900/30 dark:to-indigo-800/30"
            }`}
          />
        )}
      </AnimatePresence>

      {/* Animated Icon */}
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.div
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            className="relative z-10 text-amber-500"
          >
            <FiSun className="h-5 w-5 filter drop-shadow-sm" />
            <motion.div 
              className="absolute inset-0 bg-amber-500/20 rounded-full blur-md"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            className="relative z-10 text-indigo-400"
          >
            <FiMoon className="h-5 w-5 filter drop-shadow-sm" />
            <motion.div 
              className="absolute inset-0 bg-indigo-400/20 rounded-full blur-md"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
} 