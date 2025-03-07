"use client";

import Image from "next/image";
import { Playlist } from "@/lib/firebase/playlistUtils";
import { formatDistanceToNow } from "date-fns";
import { PiPlayCircleFill, PiPencilSimpleLine, PiTrash, PiMusicNotesFill } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (playlistId: string) => void;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlistId: string) => void;
}

const PlaylistCard = ({ playlist, onPlay, onEdit, onDelete }: PlaylistCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/playlists/${playlist.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.id) {
      onPlay(playlist.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(playlist);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && playlist.id) {
      onDelete(playlist.id);
    }
  };

  // Get the time since the playlist was updated
  const timeAgo = formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true });

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-white hover:bg-white/95 dark:bg-neutral-800 dark:hover:bg-neutral-800/95 transition-colors duration-300 cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:shadow-lg"
      onClick={handleCardClick}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {playlist.coverImage ? (
          <Image
            src={playlist.coverImage}
            alt={playlist.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600 transition-colors duration-300">
            <PiMusicNotesFill className="text-6xl text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm group-hover:backdrop-blur-none">
          <Button
            onClick={handlePlayClick}
            variant="ghost"
            size="icon"
            className="text-white text-6xl hover:scale-110 transition-transform bg-transparent hover:bg-transparent"
            aria-label="Play playlist"
          >
            <PiPlayCircleFill className="h-16 w-16 drop-shadow-lg" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate mb-1">{playlist.name}</h3>
        
        {playlist.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-3">{playlist.description}</p>
        )}
        
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{timeAgo}</span>
          
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                onClick={handleEditClick}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                aria-label="Edit playlist"
              >
                <PiPencilSimpleLine className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={handleDeleteClick}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500"
                aria-label="Delete playlist"
              >
                <PiTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard; 