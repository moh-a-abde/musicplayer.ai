"use client";

import { useState } from "react";
import { usePlaylists } from "@/lib/hooks/usePlaylists";
import { BiLoaderAlt } from "react-icons/bi";
import { PiXCircleFill, PiWarningCircleFill } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DeletePlaylistConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | null;
  playlistName: string;
}

const DeletePlaylistConfirmation = ({
  isOpen,
  onClose,
  playlistId,
  playlistName
}: DeletePlaylistConfirmationProps) => {
  const { deletePlaylist } = usePlaylists();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen || !playlistId) return null;
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      await deletePlaylist(playlistId);
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete playlist");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <PiWarningCircleFill className="text-red-500" />
              Delete Playlist
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              aria-label="Close modal"
            >
              <PiXCircleFill className="text-2xl" />
            </Button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/60 rounded-md text-red-600 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-neutral-700 dark:text-neutral-200 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{playlistName}"</span>?
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              This action cannot be undone. All songs in this playlist will be removed from the playlist, but they will remain in your library.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-full"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="rounded-full flex items-center gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <BiLoaderAlt className="animate-spin text-lg" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Playlist</span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeletePlaylistConfirmation; 