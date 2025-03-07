"use client";

import { Playlist } from "@/lib/firebase/playlistUtils";
import PlaylistCard from "./PlaylistCard";
import { usePlaylists } from "@/lib/hooks/usePlaylists";
import { useState } from "react";
import { motion } from "framer-motion";

interface PlaylistListProps {
  playlists: Playlist[];
  onPlay: (playlistId: string) => void;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlistId: string) => void;
  isLoading?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PlaylistList = ({ 
  playlists, 
  onPlay, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: PlaylistListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex flex-col rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700/20 p-4 animate-pulse">
            <div className="aspect-square w-full mb-4 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {playlists.map((playlist) => (
        <motion.div key={playlist.id} variants={itemVariants}>
          <PlaylistCard
            playlist={playlist}
            onPlay={onPlay}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PlaylistList; 