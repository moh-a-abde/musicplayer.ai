"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FiMusic, FiUpload, FiStar, FiHome, FiUser, FiMenu, FiX, FiHeadphones, FiList } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "./ui/button";
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { useAuth } from "@/lib/hooks/useAuth";

// Use a fixed timestamp for cache busting to prevent hydration issues
const timestamp = '20240606001';

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: <FiHome className="h-5 w-5" />,
  },
  {
    name: "Library",
    href: "/library",
    icon: <FiMusic className="h-5 w-5" />,
  },
  {
    name: "Upload",
    href: "/upload",
    icon: <FiUpload className="h-5 w-5" />,
  },
  {
    name: "Recommendations",
    href: "/recommendations",
    icon: <FiStar className="h-5 w-5" />,
  },
  {
    name: "Player",
    href: "/player",
    icon: <FiHeadphones className="h-5 w-5" />,
  },
  {
    name: "Playlists",
    href: "/playlists",
    icon: <FiList className="h-5 w-5" />,
  },
];

interface NavItemProps {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
}

function NavItem({ children, href, icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative group flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
        isActive 
          ? "text-white shadow-sm shadow-primary-500/10 dark:shadow-primary-900/20"
          : "text-neutral-700 hover:text-primary-600 hover:bg-white/50 dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-white/5"
      )}
    >
      <span className={cn(
        "transition-transform duration-300 group-hover:scale-110",
        isActive ? "text-white" : "text-primary-500 dark:text-primary-400"
      )}>
        {icon}
      </span>
      <span>{children}</span>
      
      {/* Active indicator with layoutId for smooth transitions */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600/85 via-indigo-500/85 to-secondary-600/85 backdrop-blur-sm -z-10"
          layoutId="navbar-active-indicator"
          initial={false}
          transition={{ 
            type: "spring", 
            bounce: 0.15, 
            duration: 0.5 
          }}
        />
      )}
      
      {/* Hover indicator */}
      {!isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white/0 dark:bg-white/0 border border-transparent dark:border-transparent group-hover:border-primary-200/30 dark:group-hover:border-primary-700/30 transition-all duration-300 -z-10"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}

// Mobile menu nav item component
interface MobileNavItemProps extends NavItemProps {
  onClose: () => void;
}

function MobileNavItem({ children, href, icon, isActive, onClose }: MobileNavItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
          isActive
            ? "text-white"
            : "text-neutral-700 hover:text-primary-600 hover:bg-white/50 dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-white/5"
        )}
        onClick={onClose}
      >
        <span className={isActive ? "text-white" : "text-primary-500 dark:text-primary-400"}>
          {icon}
        </span>
        <span>{children}</span>
        
        {/* Active indicator with layoutId for smooth transitions */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600/85 via-indigo-500/85 to-secondary-600/85 backdrop-blur-sm -z-10"
            layoutId="mobile-navbar-active-indicator"
            initial={false}
            transition={{ 
              type: "spring", 
              bounce: 0.15, 
              duration: 0.5 
            }}
          />
        )}
      </Link>
    </motion.div>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle component mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Force reload icons when component mounts
  useEffect(() => {
    // Preload images to force browser to fetch the latest versions
    const preloadImages = () => {
      const iconUrls = [
        `/icon.svg?v=${timestamp}`,
        `/favicon.svg?v=${timestamp}`,
        `/logo.svg?v=${timestamp}`,
        `/logo-with-icon.svg?v=${timestamp}`
      ];
      
      iconUrls.forEach(url => {
        // Use window.Image constructor with proper typing
        const img = new window.Image();
        img.src = url;
      });
    };
    
    // Update favicon link element
    const updateFavicon = () => {
      const linkElements = document.querySelectorAll('link[rel="icon"]');
      if (linkElements.length === 0) {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = `/favicon.svg?v=${timestamp}`;
        newLink.type = 'image/svg+xml';
        document.head.appendChild(newLink);
      } else {
        linkElements.forEach(link => {
          // Type assertion to HTMLLinkElement
          const linkEl = link as HTMLLinkElement;
          linkEl.href = `/favicon.svg?v=${timestamp}`;
        });
      }
    };
    
    preloadImages();
    updateFavicon();
  }, []);

  // If not mounted yet, render a placeholder to prevent layout shift
  if (!mounted) {
    return (
      <div className="sticky top-0 z-40 w-full h-16 backdrop-blur-xl bg-gradient-to-r from-primary-600/5 via-primary-500/5 to-secondary-600/5 dark:from-primary-900/20 dark:via-primary-800/20 dark:to-secondary-900/20"></div>
    );
  }

  const handleProfileClick = () => {
    if (user) {
      router.push('/profile');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-40 w-full backdrop-blur-xl transition-all",
        scrolled 
          ? "bg-gradient-to-r from-primary-600/10 via-primary-500/10 to-secondary-600/10 dark:from-primary-900/30 dark:via-primary-800/30 dark:to-secondary-900/30 border-b border-primary-200/30 dark:border-primary-800/30 shadow-sm"
          : "bg-gradient-to-r from-primary-600/5 via-primary-500/5 to-secondary-600/5 dark:from-primary-900/20 dark:via-primary-800/20 dark:to-secondary-900/20"
      )}
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex h-16 items-center px-4 md:px-6 relative">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <div className="relative w-10 h-10">
              <Image
                src={`/icon.svg?v=${timestamp}`}
                alt="musicplayer.ai"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-1 bg-gradient-to-r from-white/40 to-white/30 dark:from-neutral-800/40 dark:to-neutral-800/30 backdrop-blur-md p-1.5 rounded-full border border-primary-200/20 dark:border-primary-700/20 shadow-sm">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  isActive={pathname === item.href}
                >
                  {item.name}
                </NavItem>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ThemeToggle />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border border-primary-200/30 dark:border-primary-700/30 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md shadow-sm"
                aria-label="User menu"
                onClick={handleProfileClick}
              >
                <FiUser className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="md:hidden"
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border border-primary-200/30 dark:border-primary-700/30 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md shadow-sm"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open mobile menu"
              >
                <FiMenu className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-gradient-to-b from-white/90 to-white/80 dark:from-neutral-900/90 dark:to-neutral-900/80 backdrop-blur-xl z-50 md:hidden shadow-xl border-l border-primary-200/30 dark:border-primary-800/30"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="relative w-10 h-10">
                      <Image
                        src={`/icon.svg?v=${timestamp}`}
                        alt="musicplayer.ai"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </Link>
                  <motion.button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-500 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md p-2 rounded-full border border-primary-200/30 dark:border-primary-700/30"
                    aria-label="Close mobile menu"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiX className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <MobileNavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      isActive={pathname === item.href}
                      onClose={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </MobileNavItem>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <ThemeToggle />
                  <motion.button 
                    className="flex items-center justify-center h-10 w-10 rounded-full overflow-hidden border border-primary-200/30 dark:border-primary-700/30 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-neutral-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProfileClick}
                  >
                    <FiUser className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 