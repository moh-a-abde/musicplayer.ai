"use client";

import { useState } from "react";
import { usePlaylists } from "@/lib/hooks/usePlaylists";
import { Playlist } from "@/lib/firebase/playlistUtils";
import PlaylistList from "../components/playlists/PlaylistList";
import CreatePlaylistButton from "../components/playlists/CreatePlaylistButton";
import CreatePlaylistModal from "../components/playlists/CreatePlaylistModal";
import EditPlaylistModal from "../components/playlists/EditPlaylistModal";
import DeletePlaylistConfirmation from "../components/playlists/DeletePlaylistConfirmation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { PiMusicNotesFill } from "react-icons/pi";
import { motion } from "framer-motion";

export default function PlaylistsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const { playlists, isLoading, playPlaylist } = usePlaylists();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null);
  const [deletePlaylistName, setDeletePlaylistName] = useState("");
  
  const handlePlayPlaylist = (playlistId: string) => {
    playPlaylist(playlistId).catch(error => {
      console.error("Error playing playlist:", error);
    });
  };
  
  const handleEditPlaylist = (playlist: Playlist) => {
    setEditPlaylist(playlist);
  };
  
  const handleDeletePlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      setDeletePlaylistId(playlistId);
      setDeletePlaylistName(playlist.name);
    }
  };
  
  return (
    <>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-24">
        {/* Visual Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl dark:bg-primary-400/10"></div>
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-secondary-400/20 rounded-full filter blur-3xl dark:bg-secondary-400/10"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl dark:bg-primary-400/10"></div>
        </div>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold">Your Playlists</h1>
                {user ? (
                  <CreatePlaylistButton onClick={() => setIsCreateModalOpen(true)} />
                ) : (
                  <button 
                    onClick={() => router.push('/auth/signin')}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-primary-600 hover:bg-white/90 h-10 px-4 py-2"
                  >
                    Sign in to create
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : !user ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24"
                >
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                    <PiMusicNotesFill className="w-10 h-10 text-primary-600 dark:text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                    Sign in to view your playlists
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-8 max-w-lg mx-auto">
                    Create and manage your music playlists
                  </p>
                  <button 
                    onClick={() => router.push('/auth/signin')}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 py-2"
                  >
                    Sign in
                  </button>
                </motion.div>
              ) : playlists.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24"
                >
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                    <PiMusicNotesFill className="w-10 h-10 text-primary-600 dark:text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                    No playlists yet
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-8 max-w-lg mx-auto">
                    Create your first playlist to get started
                  </p>
                </motion.div>
              ) : (
                <PlaylistList
                  playlists={playlists}
                  onPlay={handlePlayPlaylist}
                  onEdit={handleEditPlaylist}
                  onDelete={handleDeletePlaylist}
                />
              )}
            </div>
          </motion.div>
        </main>
      </div>
      
      {/* Modals */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <EditPlaylistModal
        isOpen={!!editPlaylist}
        onClose={() => setEditPlaylist(null)}
        playlist={editPlaylist}
      />
      
      <DeletePlaylistConfirmation
        isOpen={!!deletePlaylistId}
        onClose={() => setDeletePlaylistId(null)}
        playlistId={deletePlaylistId}
        playlistName={deletePlaylistName}
      />
    </>
  );
} 