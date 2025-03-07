'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getUserMusicFiles, 
  getMusicFilesByFilter, 
  deleteMusicFile, 
  updateMusicFileMetadata,
  MusicFile
} from '@/lib/firebase/musicStorageUtils';
import { searchMusicIndex, getUniqueIndexValues } from '@/lib/firebase/musicIndexUtils';

interface MusicLibraryState {
  // State
  isLoading: boolean;
  error: string | null;
  library: MusicFile[];
  filteredLibrary: MusicFile[];
  currentFilter: Partial<MusicFile> | null;
  
  // Actions
  loadLibrary: () => Promise<void>;
  filterLibrary: (filter: Partial<MusicFile>) => Promise<void>;
  deleteMusic: (musicId: string) => Promise<void>;
  updateMetadata: (musicId: string, metadata: Partial<MusicFile>) => Promise<void>;
  clearFilters: () => void;
  searchLibrary: (query: string) => Promise<void>;
  getUniqueValues: (field: keyof MusicFile) => Promise<string[]>;
}

const useMusicLibraryStore = create<MusicLibraryState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      library: [],
      filteredLibrary: [],
      currentFilter: null,
      
      // Load all music from Firebase
      loadLibrary: async () => {
        set({ isLoading: true, error: null });
        try {
          const musicFiles = await getUserMusicFiles();
          set({ 
            library: musicFiles, 
            filteredLibrary: musicFiles,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error loading music library:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load music library',
            isLoading: false 
          });
        }
      },
      
      // Filter music by metadata
      filterLibrary: async (filter) => {
        set({ isLoading: true, error: null, currentFilter: filter });
        try {
          const filteredFiles = await getMusicFilesByFilter(filter);
          set({ filteredLibrary: filteredFiles, isLoading: false });
        } catch (error) {
          console.error('Error filtering music library:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to filter music library',
            isLoading: false
          });
        }
      },
      
      // Delete a music file
      deleteMusic: async (musicId) => {
        set({ isLoading: true, error: null });
        try {
          await deleteMusicFile(musicId);
          
          // Update local state by removing the deleted file
          const { library, filteredLibrary, currentFilter } = get();
          const updatedLibrary = library.filter(music => music.id !== musicId);
          const updatedFilteredLibrary = filteredLibrary.filter(music => music.id !== musicId);
          
          set({
            library: updatedLibrary,
            filteredLibrary: updatedFilteredLibrary,
            isLoading: false
          });
        } catch (error) {
          console.error('Error deleting music file:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete music file',
            isLoading: false
          });
        }
      },
      
      // Update music metadata
      updateMetadata: async (musicId, metadata) => {
        set({ isLoading: true, error: null });
        try {
          const updatedMusic = await updateMusicFileMetadata(musicId, metadata);
          
          // Update local state with the updated metadata
          const { library, filteredLibrary } = get();
          const updatedLibrary = library.map(music => 
            music.id === musicId ? { ...music, ...updatedMusic } : music
          );
          const updatedFilteredLibrary = filteredLibrary.map(music => 
            music.id === musicId ? { ...music, ...updatedMusic } : music
          );
          
          set({
            library: updatedLibrary,
            filteredLibrary: updatedFilteredLibrary,
            isLoading: false
          });
        } catch (error) {
          console.error('Error updating music metadata:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to update music metadata',
            isLoading: false
          });
        }
      },
      
      // Clear all filters
      clearFilters: () => {
        const { library } = get();
        set({ 
          filteredLibrary: library, 
          currentFilter: null 
        });
      },
      
      // Search library by text query using the index
      searchLibrary: async (query) => {
        const { library } = get();
        
        set({ isLoading: true });
        
        if (!query.trim()) {
          set({ filteredLibrary: library, isLoading: false });
          return;
        }
        
        try {
          // Use the indexed search from musicIndexUtils
          const matchingIds = await searchMusicIndex(query);
          
          if (matchingIds.length === 0) {
            set({ filteredLibrary: [], isLoading: false });
            return;
          }
          
          // Filter the library to only include the matching IDs
          const results = library.filter(music => 
            music.id && matchingIds.includes(music.id)
          );
          
          set({ filteredLibrary: results, isLoading: false });
        } catch (error) {
          console.error('Error searching music library:', error);
          
          // Fallback to client-side search if the index search fails
          const lowerQuery = query.toLowerCase();
          const results = library.filter(music => 
            music.title.toLowerCase().includes(lowerQuery) ||
            music.artist.toLowerCase().includes(lowerQuery) ||
            (music.album && music.album.toLowerCase().includes(lowerQuery))
          );
          
          set({ 
            filteredLibrary: results,
            isLoading: false,
            error: 'Index search failed, falling back to basic search'
          });
        }
      },
      
      // Get unique values for a field from the index
      getUniqueValues: async (field) => {
        try {
          const values = await getUniqueIndexValues(field as string);
          return values;
        } catch (error) {
          console.error(`Error getting unique values for ${field}:`, error);
          
          // Fallback to extracting values from the library
          const { library } = get();
          const valueSet = new Set<string>();
          
          library.forEach(music => {
            const value = music[field];
            if (value && typeof value === 'string') {
              valueSet.add(value);
            }
          });
          
          return Array.from(valueSet);
        }
      }
    }),
    {
      name: 'music-library-storage',
      partialize: (state) => ({ library: state.library }),
    }
  )
);

export default useMusicLibraryStore; 