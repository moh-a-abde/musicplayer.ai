"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlaylists } from "@/lib/hooks/usePlaylists";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";
import { MusicFile } from "@/lib/firebase/musicStorageUtils";
import { BiLoaderAlt } from "react-icons/bi";
import { PiPlayCircleFill, PiDotsThreeVerticalBold, PiPencilSimpleLine, PiTrash, PiMusicNotesFill } from "react-icons/pi";
import EditPlaylistModal from "@/app/components/playlists/EditPlaylistModal";
import DeletePlaylistConfirmation from "@/app/components/playlists/DeletePlaylistConfirmation";
import { formatDistanceToNow } from "date-fns";

// Custom function to format duration in seconds to MM:SS
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { getPlaylistWithSongs, playPlaylist } = usePlaylists();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<MusicFile[]>([]);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }
  
  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const playlistId = Array.isArray(id) ? id[0] : id;
        const playlistData = await getPlaylistWithSongs(playlistId);
        
        setPlaylist({
          ...playlistData,
          id: playlistId
        });
        setSongs(playlistData.songs || []);
      } catch (err: any) {
        console.error("Error fetching playlist:", err);
        setError(err.message || "Failed to load playlist");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaylist();
  }, [id, getPlaylistWithSongs]);
  
  const handlePlayPlaylist = async () => {
    if (!playlist?.id) return;
    
    try {
      await playPlaylist(playlist.id);
    } catch (err: any) {
      console.error("Error playing playlist:", err);
      setError(err.message || "Failed to play playlist");
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-red-200">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || "Failed to load playlist"}</p>
            <button 
              onClick={() => router.push("/playlists")}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white"
            >
              Back to Playlists
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const timeAgo = formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true });
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Playlist Header */}
        <div className="bg-neutral-800 rounded-xl shadow-md border border-neutral-700 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 h-64 relative rounded-lg overflow-hidden bg-neutral-700 flex-shrink-0">
                {playlist.coverImage ? (
                  <Image
                    src={playlist.coverImage}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-700">
                    <PiMusicNotesFill className="text-6xl text-neutral-500" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
                    {playlist.description && (
                      <p className="text-neutral-400 mb-4">{playlist.description}</p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-700"
                      aria-label="Playlist options"
                    >
                      <PiDotsThreeVerticalBold className="text-2xl" />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg z-10 py-1 border border-neutral-700">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowEditModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-700 flex items-center"
                        >
                          <PiPencilSimpleLine className="mr-2" />
                          Edit Playlist
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-700 flex items-center"
                        >
                          <PiTrash className="mr-2" />
                          Delete Playlist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-neutral-500 mb-6">
                  <p>Created {timeAgo}</p>
                  <p>{songs.length} songs</p>
                </div>
                
                <button
                  onClick={handlePlayPlaylist}
                  disabled={songs.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PiPlayCircleFill className="text-2xl" />
                  <span>Play</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Songs List */}
        <div className="bg-neutral-800 rounded-xl shadow-md border border-neutral-700 overflow-hidden">
          <div className="p-6">
            {songs.length === 0 ? (
              <div className="text-center py-12">
                <PiMusicNotesFill className="h-16 w-16 mx-auto text-neutral-600 mb-4" />
                <p className="text-neutral-400 text-lg">No songs in this playlist</p>
                <p className="text-neutral-500 mt-2">Add songs to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-neutral-700 text-left text-neutral-500 text-sm">
                      <th className="pb-3 font-medium text-left w-12">#</th>
                      <th className="pb-3 font-medium text-left">Title</th>
                      <th className="pb-3 font-medium text-left">Artist</th>
                      <th className="pb-3 font-medium text-left">Album</th>
                      <th className="pb-3 font-medium text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map((song, index) => (
                      <tr 
                        key={song.id} 
                        className="border-b border-neutral-700 hover:bg-neutral-750 transition-colors"
                      >
                        <td className="py-3 text-sm text-neutral-500">{index + 1}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            {song.coverArt && (
                              <div className="w-10 h-10 mr-3 relative rounded overflow-hidden">
                                <Image
                                  src={song.coverArt}
                                  alt={song.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">{song.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-neutral-300">{song.artist}</td>
                        <td className="py-3 text-neutral-300">{song.album || "-"}</td>
                        <td className="py-3 text-right text-neutral-400">
                          {song.duration ? formatDuration(song.duration) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modals */}
      <EditPlaylistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlist={playlist}
      />
      
      <DeletePlaylistConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        playlistId={playlist.id}
        playlistName={playlist.name}
      />
    </div>
  );
} 