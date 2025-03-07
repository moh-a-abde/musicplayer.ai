'use client';

import { useEffect, useState } from 'react';
import useMusicLibraryStore from '@/store/musicLibraryStore';
import usePlayerStore from '@/store/playerStore';
import { Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiSearch, FiFilter, FiX, FiPlay, FiPause, FiEdit } from 'react-icons/fi';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MusicFile } from '@/lib/firebase/musicStorageUtils';

// Dynamically import the metadata editor to reduce initial load time
const MusicMetadataEditor = dynamic(() => import('@/components/MusicMetadataEditor'), {
  ssr: false,
  loading: () => <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">Loading editor...</div>
});

export default function LibraryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedMusicForEdit, setSelectedMusicForEdit] = useState<MusicFile | null>(null);
  
  // Music library state
  const { 
    library, 
    filteredLibrary, 
    isLoading,
    error,
    loadLibrary,
    searchLibrary,
    filterLibrary,
    updateMetadata
  } = useMusicLibraryStore();
  
  // Player state
  const { 
    status, 
    playlist, 
    currentSongIndex,
    addToPlaylist,
    setCurrentSongIndex
  } = usePlayerStore();
  
  // Load music library on component mount
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/');
      return;
    }
    
    if (user) {
      loadLibrary();
    }
  }, [user, loading, loadLibrary, router]);
  
  // Load unique genres when the library loads
  useEffect(() => {
    const loadGenres = async () => {
      if (library.length > 0) {
        try {
          const uniqueGenres = await useMusicLibraryStore.getState().getUniqueValues('genre');
          // If we have more than just the selected genre, we need to update our list
          if (uniqueGenres.length > (selectedGenre ? 1 : 0)) {
            console.log('Loaded unique genres:', uniqueGenres);
          }
        } catch (err) {
          console.error('Error loading genres:', err);
        }
      }
    };
    
    loadGenres();
  }, [library.length, selectedGenre]);
  
  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to debounce the search
    const timeout = setTimeout(() => {
      searchLibrary(query);
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
  };
  
  // Clean up the timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);
  
  // Handle genre filter selection
  const handleGenreSelect = (genre: string | null) => {
    setSelectedGenre(genre);
    
    if (genre) {
      filterLibrary({ genre });
    } else {
      // Clear filters
      loadLibrary();
    }
  };
  
  // Play a song
  const playSong = (songIndex: number) => {
    // Check if the song is already in the playlist
    const songToPlay = filteredLibrary[songIndex];
    const playlistIndex = playlist.findIndex(song => song.url === songToPlay.url);
    
    if (playlistIndex >= 0) {
      // Song is in playlist, just set the index
      setCurrentSongIndex(playlistIndex);
    } else {
      // Add to playlist and play
      addToPlaylist({
        url: songToPlay.url,
        title: songToPlay.title,
        artist: songToPlay.artist,
        coverArt: songToPlay.coverArt,
        duration: songToPlay.duration
      });
    }
  };
  
  // Play all songs in the filtered library
  const playAll = () => {
    if (filteredLibrary.length === 0) return;
    
    // Clear existing playlist and add all songs
    const { clearPlaylist } = usePlayerStore.getState();
    clearPlaylist();
    
    filteredLibrary.forEach(song => {
      addToPlaylist({
        url: song.url,
        title: song.title,
        artist: song.artist,
        coverArt: song.coverArt,
        duration: song.duration
      });
    });
  };
  
  // Determine if a song is currently playing
  const isSongPlaying = (song: any) => {
    return status.type === 'playing' && 
           'song' in status && 
           status.song.url === song.url;
  };
  
  // Extract unique genres for filter
  const genres = Array.from(new Set(library
    .filter(song => song.genre)
    .map(song => song.genre)
  )).filter(Boolean) as string[];
  
  // Open metadata editor for a song
  const handleEditMetadata = (e: React.MouseEvent, song: MusicFile) => {
    e.stopPropagation(); // Prevent triggering the play action
    setSelectedMusicForEdit(song);
  };
  
  // Handle metadata save
  const handleMetadataSave = (updatedMusic: MusicFile) => {
    setSelectedMusicForEdit(null);
    // Reload the library to show updated data
    loadLibrary();
  };
  
  // Handle metadata editor cancel
  const handleMetadataCancel = () => {
    setSelectedMusicForEdit(null);
  };
  
  // Loading state
  if (isLoading && library.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-300">Loading your music library...</p>
          </div>
        </div>
      </>
    );
  }
  
  // Error state
  if (error) {
    return (
      <>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Failed to load library</h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">{error}</p>
            <Button onClick={() => loadLibrary()}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-24">
        {/* Visual Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl dark:bg-primary-400/10"></div>
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-secondary-400/20 rounded-full filter blur-3xl dark:bg-secondary-400/10"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl dark:bg-primary-400/10"></div>
        </div>
        
        {/* Metadata Editor Modal */}
        <AnimatePresence>
          {selectedMusicForEdit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            >
              <MusicMetadataEditor
                music={selectedMusicForEdit}
                onSave={handleMetadataSave}
                onCancel={handleMetadataCancel}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                  Your Music Library
                </h1>
                <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="font-medium">
                    <span className="text-primary-600 dark:text-primary-500">{library.length}</span> Songs
                  </div>
                  <div className="font-medium">
                    <span className="text-primary-600 dark:text-primary-500">
                      {library.reduce((acc, song) => acc + (song.duration || 0), 0) > 0
                        ? Math.floor(library.reduce((acc, song) => acc + (song.duration || 0), 0) / 60)
                        : 0
                      }
                    </span> Minutes
                  </div>
                </div>
              </motion.div>
              
              <div className="flex space-x-2 mt-4 md:mt-0">
                <Button onClick={playAll} disabled={filteredLibrary.length === 0}>
                  <FiPlay className="mr-2" />
                  Play All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <FiFilter className="mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search your library..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              {/* Genre Filters */}
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: isFiltersOpen ? 'auto' : 0,
                  opacity: isFiltersOpen ? 1 : 0
                }}
                className="overflow-hidden mt-4"
              >
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                  <h3 className="font-medium mb-3 text-neutral-900 dark:text-neutral-100">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedGenre === null 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                      onClick={() => handleGenreSelect(null)}
                    >
                      All
                    </button>
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedGenre === genre 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                        onClick={() => handleGenreSelect(genre)}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Music Library */}
            <div>
              {filteredLibrary.length === 0 ? (
                <div className="text-center py-12">
                  <FiMusic className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2 text-neutral-900 dark:text-neutral-100">No music found</h3>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    {library.length === 0 
                      ? "Your library is empty. Upload some music to get started!" 
                      : "No music matches your current filters."}
                  </p>
                  {library.length === 0 && (
                    <Button className="mt-4" onClick={() => router.push('/upload')}>
                      Upload Music
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] md:grid-cols-[auto_2fr_1fr_1fr_auto_auto] gap-4 p-4 border-b border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    <div>#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Artist</div>
                    <div>Album</div>
                    <div>Duration</div>
                    <div>Actions</div>
                  </div>
                  
                  {filteredLibrary.map((song, index) => (
                    <motion.div
                      key={song.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`grid grid-cols-[auto_1fr_1fr_auto_auto] md:grid-cols-[auto_2fr_1fr_1fr_auto_auto] gap-4 p-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-750 ${
                        isSongPlaying(song) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                      onClick={() => playSong(index)}
                    >
                      <div className="flex justify-center items-center w-8 h-8">
                        {isSongPlaying(song) ? (
                          <FiPause className="text-primary-500" />
                        ) : (
                          <span className="text-neutral-400">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-700 mr-3 flex-shrink-0">
                          {song.coverArt ? (
                            <img 
                              src={song.coverArt} 
                              alt={song.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiMusic className="text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {song.title}
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden md:block truncate text-neutral-600 dark:text-neutral-300">
                        {song.artist}
                      </div>
                      
                      <div className="truncate text-neutral-600 dark:text-neutral-300">
                        {song.album || 'Unknown Album'}
                      </div>
                      
                      <div className="text-neutral-600 dark:text-neutral-300 text-right">
                        {song.duration 
                          ? `${Math.floor(song.duration / 60)}:${String(Math.floor(song.duration % 60)).padStart(2, '0')}` 
                          : '--:--'}
                      </div>
                      
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => handleEditMetadata(e, song)}
                          className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                          title="Edit Metadata"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 