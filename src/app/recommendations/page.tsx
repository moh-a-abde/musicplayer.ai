'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiMusic, FiArrowLeft, FiHeadphones } from 'react-icons/fi';
import usePlayerStore from '@/store/playerStore';
import AIRecommendations from '@/components/AIRecommendations';
import { Button } from '@/components/ui/button';

export default function RecommendationsPage() {
  const playlist = usePlayerStore(state => state.playlist);

  return (
    <>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-24">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {playlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <FiHeadphones className="w-10 h-10 text-primary-600 dark:text-primary-500" />
              </div>
              <h2 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                No songs in your playlist yet
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 mb-8 max-w-md mx-auto">
                Upload some songs to get personalized AI-powered recommendations based on your music taste
              </p>
              <Button asChild className="gap-2">
                <Link href="/upload">
                  <FiArrowLeft className="w-4 h-4" />
                  Upload Music
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="mb-12">
                <div className="relative mb-16">
                  <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-4 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                        Your <span className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-500 dark:to-secondary-500 bg-clip-text text-transparent">AI-Powered</span> Recommendations
                      </h1>
                      <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl">
                        Based on your uploaded songs, our AI has analyzed your music taste and generated these personalized recommendations for you
                      </p>
                    </div>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                  <AIRecommendations />
                </motion.div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
