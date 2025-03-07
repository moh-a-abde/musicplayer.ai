'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiPlus, FiLoader, FiThumbsUp, FiRefreshCw, FiInfo } from 'react-icons/fi';
import usePlayerStore from '@/store/playerStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Recommendation {
  title: string;
  artist: string;
  reason: string;
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'similar' | 'discover'>('similar');
  const [infoVisible, setInfoVisible] = useState(false);
  const animationCompleted = useRef(false);

  const playlist = usePlayerStore(state => state.playlist);
  const addToPlaylist = usePlayerStore(state => state.addToPlaylist);

  const getRecommendations = async () => {
    if (!playlist.length) {
      setError('Please add some songs to your playlist first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      animationCompleted.current = false;

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          songs: playlist.map(song => ({
            title: song.title || 'Unknown Title',
            artist: song.artist || 'Unknown Artist'
          })),
          type: activeTab
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format');
      }

      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get recommendations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, generate mock recommendations if the real API isn't available
  const generateMockRecommendations = () => {
    if (playlist.length === 0) {
      setError('Please add some songs to your playlist first');
      return;
    }
    
    setLoading(true);
    setError(null);
    animationCompleted.current = false;
    
    // Simulate API delay
    setTimeout(() => {
      let mockRecommendations: Recommendation[];
      
      if (activeTab === 'similar') {
        mockRecommendations = [
          {
            title: "Lost in the Echo",
            artist: "Linkin Park",
            reason: "Based on your preference for rock music with electronic elements"
          },
          {
            title: "In the End",
            artist: "Black Veil Brides",
            reason: "Similar vocal style and energy to your uploaded tracks"
          },
          {
            title: "Numb",
            artist: "Disturbed",
            reason: "Matching the emotional tone and instrumentation of your playlist"
          },
          {
            title: "Breaking the Habit",
            artist: "Three Days Grace",
            reason: "Shares thematic elements with your most played songs"
          }
        ];
      } else {
        mockRecommendations = [
          {
            title: "Blinding Lights",
            artist: "The Weeknd",
            reason: "A different genre that matches the energy level of your playlist"
          },
          {
            title: "Starboy",
            artist: "The Weeknd",
            reason: "Expanding your taste with similar rhythm patterns"
          },
          {
            title: "Levitating",
            artist: "Dua Lipa",
            reason: "Different style but complementary to your music preferences"
          },
          {
            title: "Save Your Tears",
            artist: "The Weeknd",
            reason: "New sound direction based on your melodic preferences"
          }
        ];
      }
      
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1500);
  };

  const handleGetRecommendations = () => {
    // Reset current recommendations
    setRecommendations([]);
    
    // Try real API first, if it fails, use mock data
    getRecommendations().catch(() => {
      generateMockRecommendations();
    });
  };

  const handleAddToPlaylist = (rec: Recommendation) => {
    addToPlaylist({
      title: rec.title,
      artist: rec.artist,
      url: '', // Empty string instead of null for recommended songs
      duration: 0
    });
    
    // Show feedback
    const element = document.getElementById(`rec-${rec.title.replace(/\s+/g, '-')}`);
    if (element) {
      element.classList.add('bg-primary-50', 'dark:bg-primary-900/20');
      setTimeout(() => {
        element.classList.remove('bg-primary-50', 'dark:bg-primary-900/20');
      }, 500);
    }
  };

  return (
    <div className="relative p-6">
      {/* Info Tooltip */}
      <AnimatePresence>
        {infoVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-6 top-16 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 z-20"
          >
            <h3 className="font-medium text-neutral-900 dark:text-neutral-50 mb-2">How it works</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Our AI analyzes your music library and generates personalized recommendations based on:
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 list-disc pl-4 space-y-1">
              <li>Genre preferences</li>
              <li>Listening patterns</li>
              <li>Audio characteristics</li>
              <li>Lyrical themes</li>
            </ul>
            <button 
              onClick={() => setInfoVisible(false)}
              className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Your Recommendations</h2>
          <button 
            onClick={() => setInfoVisible(!infoVisible)}
            className="ml-2 text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-500 transition-colors"
            aria-label="How it works"
          >
            <FiInfo className="w-5 h-5" />
          </button>
        </div>
        <div className="flex space-x-2 items-center">
          {/* Tabs */}
          <div className="flex mr-3 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setActiveTab('similar')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'similar' 
                  ? "bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              )}
            >
              <span className="flex items-center">
                <FiMusic className="mr-1.5 w-3.5 h-3.5" />
                Similar
              </span>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'discover' 
                  ? "bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              )}
            >
              <span className="flex items-center">
                <FiRefreshCw className="mr-1.5 w-3.5 h-3.5" />
                Discover
              </span>
            </button>
          </div>
          <Button
            onClick={handleGetRecommendations}
            disabled={loading || playlist.length === 0}
            className="gap-2 rounded-md"
            isLoading={loading}
            variant="gradient"
          >
            {!loading && <FiMusic className="w-4 h-4" />}
            Get Recommendations
          </Button>
        </div>
      </div>

      {/* Description text */}
      <p className="text-neutral-600 dark:text-neutral-400 mt-1 mb-6">
        {activeTab === 'similar' 
          ? 'AI-powered suggestions similar to your current music taste'
          : 'Discover new genres and artists outside your usual preferences'}
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-3"></div>
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-full mb-2"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-4/5"></div>
                  </div>
                </div>
                <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && !loading ? (
        <motion.div
          initial={false}
          className="grid gap-4"
        >
          {recommendations.map((rec, index) => (
            <motion.div
              id={`rec-${rec.title.replace(/\s+/g, '-')}`}
              key={`${rec.title}-${rec.artist}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                onComplete: () => {
                  if (index === recommendations.length - 1) {
                    animationCompleted.current = true;
                  }
                }
              }}
              className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{rec.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{rec.artist}</p>
                  <div className="mt-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded text-sm text-neutral-700 dark:text-neutral-300 border-l-2 border-primary-500">
                    <p>{rec.reason}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToPlaylist(rec)}
                  className="ml-4 flex flex-col items-center justify-center gap-1 text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/30">
                    <FiPlus className="w-5 h-5" />
                  </div>
                  <span className="text-xs">Add</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : !loading && !error ? (
        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-full" />
              <FiMusic className="absolute inset-0 m-auto w-8 h-8 text-primary-600 dark:text-primary-500" />
              <motion.div
                className="absolute inset-0 bg-primary-200/30 dark:bg-primary-700/20 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>
            <p className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">No recommendations yet</p>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">Click the button above to get personalized music recommendations</p>
            <p className="mt-4 text-sm text-neutral-400 dark:text-neutral-500">
              {playlist.length === 0 ? "You need to add songs to your playlist first" : ""}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
