'use client';

import MusicPlayer from '@/components/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiMusic, FiHeadphones, FiList, FiChevronRight, FiHeart, FiPlus, FiClock } from 'react-icons/fi';
import usePlayerStore, { Song } from '@/store/playerStore';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PlayerPage() {
  const { addToPlaylist, playlist, currentSongIndex, loadPlaylist } = usePlayerStore(state => ({
    addToPlaylist: state.addToPlaylist,
    playlist: state.playlist,
    currentSongIndex: state.currentSongIndex,
    loadPlaylist: state.loadPlaylist
  }));
  
  const [activeView, setActiveView] = useState<'playlist' | 'library'>('playlist');
  const [uploadHover, setUploadHover] = useState(false);

  // Format duration from seconds to MM:SS
  const formatDuration = (duration: number): string => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const songsToAdd: Song[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        songsToAdd.push({
          url,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local File'
        });
      }
    }

    // If we found audio files, load them into the playlist and start playing
    if (songsToAdd.length > 0) {
      // Use loadPlaylist instead of addToPlaylist to start playing immediately
      if (playlist.length === 0) {
        // If playlist is empty, replace it with new songs
        console.log("Loading new playlist with uploaded songs");
        loadPlaylist(songsToAdd);
      } else {
        // If playlist already has songs, add the new ones and continue playing current song
        console.log("Adding songs to existing playlist");
        songsToAdd.forEach(song => addToPlaylist(song));
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Audio Player */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-16 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-8"
        >
          <MusicPlayer />
        </motion.div>
        
        {/* Page Content */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          {/* Upload Section - Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/3"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">Your Music Library</h2>
                <p className="text-primary-100 dark:text-primary-200 text-sm">
                  Upload your favorite tracks to listen and get recommendations
                </p>
              </div>
              
              <div className="p-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden mb-6"
                  onHoverStart={() => setUploadHover(true)}
                  onHoverEnd={() => setUploadHover(false)}
                >
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 transition-colors hover:border-primary-300 dark:hover:border-primary-700">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <FiUpload className="w-8 h-8 text-primary-600 dark:text-primary-500" />
                        </div>
                        <AnimatePresence>
                          {uploadHover && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute inset-0 bg-primary-200/30 dark:bg-primary-700/20 rounded-full"
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Upload Music Files</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                        Drag and drop files here or click to browse
                      </p>
                      <input
                        type="file"
                        accept="audio/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                </motion.div>
                
                {/* Library Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">
                    <div className="text-2xl font-semibold text-primary-600 dark:text-primary-500 mb-1">
                      {playlist.length}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Songs
                    </div>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">
                    <div className="text-2xl font-semibold text-primary-600 dark:text-primary-500 mb-1">
                      {playlist.reduce((acc, song) => acc + (song.duration || 0), 0) > 0
                        ? Math.floor(playlist.reduce((acc, song) => acc + (song.duration || 0), 0) / 60)
                        : 0
                      }
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Minutes
                    </div>
                  </div>
                </div>
                
                {/* Library Actions */}
                <div className="mb-2">
                  <Link href="/recommendations">
                    <Button variant="gradient" className="w-full justify-between mb-3 rounded-md">
                      <span className="flex items-center">
                        <FiHeart className="mr-2 h-4 w-4" />
                        Get Recommendations
                      </span>
                      <FiChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/upload">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center">
                        <FiPlus className="mr-2 h-4 w-4" />
                        Advanced Upload
                      </span>
                      <FiChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Playlist Section - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-2/3"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-neutral-200 dark:border-neutral-700 px-6 pt-4">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveView('playlist')}
                    className={cn(
                      "pb-4 px-1 font-medium text-sm relative",
                      activeView === 'playlist'
                        ? "text-primary-600 dark:text-primary-500"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300"
                    )}
                  >
                    <span className="flex items-center">
                      <FiList className="mr-2 h-4 w-4" />
                      Current Playlist
                    </span>
                    {activeView === 'playlist' && (
                      <motion.div
                        layoutId="active-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-500"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveView('library')}
                    className={cn(
                      "pb-4 px-1 font-medium text-sm relative",
                      activeView === 'library'
                        ? "text-primary-600 dark:text-primary-500"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300"
                    )}
                  >
                    <span className="flex items-center">
                      <FiMusic className="mr-2 h-4 w-4" />
                      All Music
                    </span>
                    {activeView === 'library' && (
                      <motion.div
                        layoutId="active-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-500"
                      />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {playlist.length === 0 ? (
                  <div className="text-center py-16">
                    <FiMusic className="h-12 w-12 mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Your playlist is empty
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                      Upload some music using the panel on the left or the upload page to get started.
                    </p>
                    <Button asChild variant="gradient" className="rounded-md">
                      <Link href="/upload">
                        Go to Upload Page
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-2 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Title</div>
                      <div className="col-span-4">Artist</div>
                      <div className="col-span-2 text-right"><FiClock className="ml-auto h-4 w-4" /></div>
                    </div>
                    
                    {/* Songs */}
                    {playlist.map((song, index) => (
                      <motion.div 
                        key={index}
                        variants={itemVariants}
                        className={cn(
                          "grid grid-cols-12 gap-4 p-3 mt-1 rounded-lg items-center hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors",
                          currentSongIndex === index ? "bg-primary-50 dark:bg-primary-900/20" : ""
                        )}
                        onClick={() => usePlayerStore.getState().setCurrentSongIndex(index)}
                      >
                        <div className="col-span-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          {currentSongIndex === index ? (
                            <FiMusic className="h-4 w-4 text-primary-600 dark:text-primary-500" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="col-span-11 md:col-span-5 font-medium text-neutral-900 dark:text-neutral-50 truncate">
                          {song.title}
                        </div>
                        <div className="hidden md:block col-span-4 text-neutral-500 dark:text-neutral-400 truncate">
                          {song.artist}
                        </div>
                        <div className="hidden md:block col-span-2 text-right text-sm text-neutral-500 dark:text-neutral-400">
                          {formatDuration(song.duration || 0)}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
