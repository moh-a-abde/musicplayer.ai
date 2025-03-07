'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiMusic, FiUpload, FiStar, FiHeadphones, FiPlayCircle, FiUploadCloud, FiPlay, FiTrendingUp } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/AnimatedLogo';

// Use a fixed timestamp for cache busting to prevent hydration issues
const timestamp = '20240606001';

// Staggered animation for children elements
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// How It Works hover animation
const stepCardVariants = {
  initial: { 
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    scale: 1
  },
  hover: { 
    y: -10,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    scale: 1.03
  }
};

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.2, rotate: 5, transition: { type: "spring", stiffness: 400 } }
};

// Card glow effect for feature cards
const glowVariants = {
  initial: {
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    boxShadow: "0 0 15px 2px rgba(79, 70, 229, 0.2), 0 0 30px 5px rgba(79, 70, 229, 0.1)",
  }
};

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
          {/* Enhanced Background with subtle animation */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 opacity-90"></div>
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.6, 0.5]
              }} 
              transition={{ 
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute top-0 -left-20 w-96 h-96 bg-primary-400/30 rounded-full mix-blend-multiply filter blur-3xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5]
              }} 
              transition={{ 
                duration: 18,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
              className="absolute top-20 -right-20 w-96 h-96 bg-secondary-400/30 rounded-full mix-blend-multiply filter blur-3xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.6, 0.4]
              }} 
              transition={{ 
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2
              }}
              className="absolute bottom-0 left-1/3 w-96 h-96 bg-primary-400/30 rounded-full mix-blend-multiply filter blur-3xl"
            ></motion.div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="text-center"
            >
              <motion.div
                variants={item}
                className="flex justify-center mb-6"
              >
                <div className="flex items-center justify-center">
                  <AnimatedLogo textSize="lg" color="gradient" animationType="pulse" className="scale-150" />
                </div>
              </motion.div>
              <motion.h1
                variants={item}
                className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-50 mb-6"
              >
                Experience Music with <span className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-500 dark:to-secondary-500 bg-clip-text text-transparent">AI</span>
              </motion.h1>
              <motion.p
                variants={item}
                className="text-xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-3xl mx-auto"
              >
                Upload your music and get personalized AI-powered recommendations tailored to your taste and listening habits.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div
                variants={item}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16"
              >
                <Button
                  asChild
                  size="xl"
                  variant="gradient"
                  className="px-8 py-4 rounded-md font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <Link href="/upload">
                    <FiUpload className="w-5 h-5 mr-2" />
                    Upload Music
                  </Link>
                </Button>
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="px-8 py-4 rounded-md font-medium shadow-sm hover:shadow transition-all flex items-center justify-center"
                >
                  <Link href="/player">
                    <FiPlayCircle className="w-5 h-5 mr-2" />
                    Play Demo
                  </Link>
                </Button>
              </motion.div>

              {/* Mock UI instead of image that would require a file */}
              <motion.div
                variants={item}
                className="relative max-w-5xl mx-auto"
              >
                <div className="relative h-[300px] md:h-[400px] lg:h-[450px] w-full rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-700">
                  <div className="absolute inset-x-0 top-0 h-14 bg-neutral-800 dark:bg-neutral-700 flex items-center px-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="absolute inset-x-0 flex justify-center">
                      <div className="px-4 py-1 rounded-full bg-primary-600/80 dark:bg-primary-600/80 text-white text-xs">
                        <AnimatedLogo textSize="sm" color="white" animationType="bounce" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 mt-14 p-4 flex flex-col">
                    <div className="flex gap-4 h-full">
                      {/* Sidebar */}
                      <div className="hidden md:block w-48 bg-neutral-800/50 dark:bg-neutral-800/50 rounded-lg p-3">
                        <div className="w-full h-8 bg-neutral-700/50 dark:bg-neutral-700/50 rounded-md mb-3"></div>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="w-full h-8 bg-neutral-700/30 dark:bg-neutral-700/30 rounded-md mb-2"></div>
                        ))}
                      </div>
                      
                      {/* Main content */}
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Player */}
                        <div className="bg-neutral-800/50 dark:bg-neutral-800/50 rounded-lg p-4 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md bg-primary-500/30 flex items-center justify-center">
                            <FiMusic className="h-8 w-8 text-primary-400" />
                          </div>
                          <div className="flex-1">
                            <div className="w-32 h-4 bg-neutral-700/50 dark:bg-neutral-700/50 rounded-md mb-2"></div>
                            <div className="w-24 h-3 bg-neutral-700/30 dark:bg-neutral-700/30 rounded-md"></div>
                          </div>
                          <div className="flex gap-2">
                            {['#', '#', '#'].map((_, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-neutral-700/50 dark:bg-neutral-700/50"></div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tracks */}
                        <div className="flex-1 bg-neutral-800/50 dark:bg-neutral-800/50 rounded-lg p-4">
                          <div className="w-32 h-5 bg-neutral-700/50 dark:bg-neutral-700/50 rounded-md mb-4"></div>
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2 mb-2 bg-neutral-700/20 dark:bg-neutral-700/20 rounded-md">
                              <div className="w-10 h-10 rounded-md bg-neutral-700/50 dark:bg-neutral-700/50"></div>
                              <div className="flex-1">
                                <div className="w-24 h-3 bg-neutral-700/50 dark:bg-neutral-700/50 rounded-md mb-2"></div>
                                <div className="w-16 h-2 bg-neutral-700/30 dark:bg-neutral-700/30 rounded-md"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-neutral-800 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute top-0 left-0 w-full h-full text-primary-50 dark:text-neutral-900/30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
            </svg>
          </div>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-primary-200/30 dark:bg-primary-700/10"
              initial={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`,
                scale: 0.5 + Math.random() * 1,
                opacity: 0.3 + Math.random() * 0.3
              }}
              animate={{
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                opacity: [0.3 + Math.random() * 0.3, 0.1 + Math.random() * 0.2]
              }}
              transition={{
                duration: 15 + Math.random() * 15,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{
                width: `${30 + Math.random() * 50}px`,
                height: `${30 + Math.random() * 50}px`
              }}
            />
          ))}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block mb-2"
              >
                <div className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium">
                  Powered by AI
                </div>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 font-heading">Our Intelligent Features</h2>
              <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                Discover a new way to experience music with our AI-powered features that learn from your listening habits.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <motion.div
                  variants={stepCardVariants}
                  className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm h-full transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Replace the line animation with a subtle glow border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 blur-lg transform scale-105"></div>
                  </div>
                  
                  {/* Icon with animated background */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 flex items-center justify-center mx-auto shadow-inner group-hover:shadow-primary-500/20">
                      <motion.div variants={iconVariants} className="text-primary-600 dark:text-primary-400">
                        <FiHeadphones className="w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-50 font-heading">Smart Music Player</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Enhanced playback experience with waveform visualization and smart playlists that adapt to your mood.
                  </p>
                  
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      hover: { opacity: 1, y: 0 }
                    }}
                    className="mt-6"
                  >
                    <Link 
                      href="/player" 
                      className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium inline-flex items-center overflow-hidden group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center">
                        Explore player
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-sm opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300"></span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <motion.div
                  variants={stepCardVariants}
                  className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm h-full transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Replace the line animation with a subtle glow border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 blur-lg transform scale-105"></div>
                  </div>
                  
                  {/* Icon with animated background */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 flex items-center justify-center mx-auto shadow-inner group-hover:shadow-primary-500/20">
                      <motion.div variants={iconVariants} className="text-primary-600 dark:text-primary-400">
                        <FiUpload className="w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-50 font-heading">Effortless Upload</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Upload your music with drag and drop interface and automatic metadata extraction for seamless organization.
                  </p>
                  
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      hover: { opacity: 1, y: 0 }
                    }}
                    className="mt-6"
                  >
                    <Link 
                      href="/upload" 
                      className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium inline-flex items-center overflow-hidden group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center">
                        Try it now
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-sm opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300"></span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="group"
              >
                <motion.div
                  variants={stepCardVariants}
                  className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm h-full transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Replace the line animation with a subtle glow border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 blur-lg transform scale-105"></div>
                  </div>
                  
                  {/* Icon with animated background */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 flex items-center justify-center mx-auto shadow-inner group-hover:shadow-primary-500/20">
                      <motion.div variants={iconVariants} className="text-primary-600 dark:text-primary-400">
                        <FiStar className="w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-50 font-heading">AI Recommendations</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Discover new music with personalized recommendations based on your listening habits and preferences.
                  </p>
                  
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      hover: { opacity: 1, y: 0 }
                    }}
                    className="mt-6"
                  >
                    <Link 
                      href="/recommendations" 
                      className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium inline-flex items-center overflow-hidden group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center">
                        Get recommendations
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-sm opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300"></span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden">
          {/* Dynamic background blobs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2]
            }} 
            transition={{ 
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-20 -left-20 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/10 rounded-full mix-blend-multiply filter blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }} 
            transition={{ 
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
            className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-400/20 dark:bg-secondary-600/10 rounded-full mix-blend-multiply filter blur-3xl"
          ></motion.div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 font-heading">How It Works</h2>
              <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with an intuitive interface to create the perfect music experience.
              </p>
            </motion.div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid md:grid-cols-3 gap-8"
            >
              <motion.div 
                variants={item}
                whileHover="hover"
                initial="initial"
                className="text-center relative"
              >
                <motion.div 
                  variants={stepCardVariants}
                  className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm h-full transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Replace the line animation with a subtle glow border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 blur-lg transform scale-105"></div>
                  </div>
                  
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 flex items-center justify-center mx-auto shadow-inner group-hover:shadow-primary-500/20">
                      {/* Remove the number span */}
                      <motion.div variants={iconVariants} className="text-primary-600 dark:text-primary-400">
                        <FiUploadCloud className="w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-50 font-heading">Upload Your Music</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Start by uploading your favorite tracks or entire albums to your personal library.
                  </p>
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      hover: { opacity: 1, y: 0 }
                    }}
                    className="mt-6"
                  >
                    <Link 
                      href="/upload" 
                      className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium inline-flex items-center overflow-hidden group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center">
                        Explore player
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-sm opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300"></span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={item}
                whileHover="hover"
                initial="initial"
                className="text-center relative"
              >
                <motion.div 
                  variants={stepCardVariants}
                  className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm h-full transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Replace the line animation with a subtle glow border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 blur-lg transform scale-105"></div>
                  </div>
                  
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 flex items-center justify-center mx-auto shadow-inner group-hover:shadow-primary-500/20">
                      {/* Remove the number span */}
                      <motion.div variants={iconVariants} className="text-primary-600 dark:text-primary-400">
                        <FiPlay className="w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-50 font-heading">Enjoy Enhanced Playback</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Experience your music with our advanced player featuring waveform visualization and mood-based playlists.
                  </p>
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      hover: { opacity: 1, y: 0 }
                    }}
                    className="mt-6"
                  >
                    <Link 
                      href="/player" 
                      className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium inline-flex items-center overflow-hidden group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center">
                        Explore player
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-sm opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300"></span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={item}
                whileHover="hover"
                initial="initial"
                className="text-center relative"
              >
                <motion.div 
                  variants={stepCardVariants}
                  className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm h-full transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Replace the line animation with a subtle glow border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 blur-lg transform scale-105"></div>
                  </div>
                  
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 flex items-center justify-center mx-auto shadow-inner group-hover:shadow-primary-500/20">
                      {/* Remove the number span */}
                      <motion.div variants={iconVariants} className="text-primary-600 dark:text-primary-400">
                        <FiTrendingUp className="w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-50 font-heading">Discover New Music</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Get intelligent recommendations based on your listening patterns and preferences.
                  </p>
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      hover: { opacity: 1, y: 0 }
                    }}
                    className="mt-6"
                  >
                    <Link 
                      href="/recommendations" 
                      className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium inline-flex items-center overflow-hidden group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center">
                        View recommendations
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-sm opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300"></span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 20, 0]
            }} 
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -top-20 -right-20 w-[30rem] h-[30rem] bg-white/10 rounded-full mix-blend-overlay filter blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -30, 0]
            }} 
            transition={{ 
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
            className="absolute bottom-0 -left-20 w-[25rem] h-[25rem] bg-white/10 rounded-full mix-blend-overlay filter blur-3xl"
          ></motion.div>
          
          {/* Floating music notes animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={`note-${i}`}
                initial={{ 
                  y: "110%", 
                  x: `${20 + i * 15}%`,
                  opacity: 0.7,
                  scale: 0.5 + Math.random() * 0.5,
                  rotate: Math.random() * 20 - 10
                }}
                animate={{ 
                  y: "-110%", 
                  rotate: Math.random() * 30 - 15,
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{ 
                  duration: 10 + Math.random() * 10,
                  repeat: Infinity,
                  delay: i * 2,
                  ease: "linear"
                }}
                className="absolute text-white/30"
              >
                {i % 2 === 0 ? 
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg> :
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3H9z"/>
                  </svg>
                }
              </motion.div>
            ))}
          </div>

          {/* Content with animations */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading"
            >
              Ready to Transform Your Music Experience?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-primary-100 mb-10 max-w-3xl mx-auto text-lg"
            >
              Join thousands of music lovers who have already enhanced their listening experience with our AI-powered platform.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/upload"
                  className="px-8 py-4 rounded-xl bg-white text-primary-600 text-lg font-medium shadow-lg shadow-primary-900/20 hover:shadow-xl hover:shadow-primary-900/30 transition-all duration-300 inline-flex items-center justify-center space-x-3 group"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: 1
                    }}
                  >
                    <FiMusic className="w-6 h-6 group-hover:text-primary-700 transition-colors" />
                  </motion.span>
                  <span className="group-hover:text-primary-700 transition-colors">Get Started Now</span>
                </Link>
              </motion.div>
              
              {/* Alternative options */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-8 flex flex-wrap justify-center gap-4 text-white/80"
              >
                <Link href="/library" className="inline-flex items-center hover:text-white transition-colors">
                  <FiHeadphones className="mr-2" /> Browse Library
                </Link>
                <span className="text-white/40">•</span>
                <Link href="/player" className="inline-flex items-center hover:text-white transition-colors">
                  <FiPlayCircle className="mr-2" /> Try Player
                </Link>
                <span className="text-white/40">•</span>
                <Link href="/recommendations" className="inline-flex items-center hover:text-white transition-colors">
                  <FiStar className="mr-2" /> View Recommendations
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
