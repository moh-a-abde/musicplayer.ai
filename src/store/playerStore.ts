'use client';

import { create } from 'zustand';

export interface Song {
  url: string;
  title: string;
  artist: string;
  duration?: number; // Optional duration in seconds
  coverArt?: string; // Optional cover art URL
}

export type PlayerStatus = 
  | { type: 'idle' }
  | { type: 'playing', song: Song }
  | { type: 'paused', song: Song }
  | { type: 'error', error: string };

export type PlayMode = 'standard' | 'repeat' | 'shuffle';

interface PlayerState {
  status: PlayerStatus;
  volume: number;
  playlist: Song[];
  currentSongIndex: number;
  currentPlaylistId?: string; // Reference to the current playlist being played
  playMode: PlayMode; // Mode for playback (standard, repeat, shuffle)
  shuffledIndices: number[]; // For shuffle mode

  // Control functions
  setStatus: (status: PlayerStatus) => void;
  setVolume: (volume: number) => void;
  addToPlaylist: (song: Song) => void;
  setCurrentSongIndex: (index: number) => void;
  clearPlaylist: () => void;
  
  // Playlist functions
  loadPlaylist: (songs: Song[], playlistId?: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  setPlayMode: (mode: PlayMode) => void;
  removeSongFromPlaylist: (index: number) => void;
}

const usePlayerStore = create<PlayerState>((set, get) => ({
  status: { type: 'idle' },
  volume: 0.5,
  playlist: [],
  currentSongIndex: 0,
  playMode: 'standard',
  shuffledIndices: [],
  
  setStatus: (status) => set({ status }),
  
  setVolume: (volume) => set({ volume }),
  
  addToPlaylist: (song) => set((state) => {
    const newPlaylist = [...state.playlist, song];
    // If this is the first song, start playing it
    if (state.playlist.length === 0) {
      return {
        playlist: newPlaylist,
        status: { type: 'playing', song },
        currentSongIndex: 0
      };
    }
    return { playlist: newPlaylist };
  }),
  
  setCurrentSongIndex: (index) => set((state) => {
    if (index < 0 || index >= state.playlist.length) return state;
    const song = state.playlist[index];
    return {
      currentSongIndex: index,
      status: { type: 'playing', song }
    };
  }),
  
  clearPlaylist: () => set({
    playlist: [],
    currentSongIndex: 0,
    status: { type: 'idle' },
    currentPlaylistId: undefined
  }),
  
  // New functions for playlist management
  loadPlaylist: (songs, playlistId) => set((state) => {
    if (songs.length === 0) return state;
    
    // Generate shuffled indices if needed
    const indices = Array.from({ length: songs.length }, (_, i) => i);
    const shuffledIndices = [...indices].sort(() => Math.random() - 0.5);
    
    return {
      playlist: songs,
      currentPlaylistId: playlistId,
      currentSongIndex: 0,
      status: { type: 'playing', song: songs[0] },
      shuffledIndices
    };
  }),
  
  playNext: () => set((state) => {
    if (state.playlist.length === 0) return state;
    
    let nextIndex = 0;
    
    if (state.playMode === 'standard') {
      // In standard mode, play the next song or stop at the end
      nextIndex = state.currentSongIndex + 1;
      if (nextIndex >= state.playlist.length) {
        // End of playlist in standard mode
        return { 
          status: { type: 'idle' },
          currentSongIndex: 0 
        };
      }
    } else if (state.playMode === 'repeat') {
      // In repeat mode, loop back to the beginning if at the end
      nextIndex = (state.currentSongIndex + 1) % state.playlist.length;
    } else if (state.playMode === 'shuffle') {
      // In shuffle mode, find the next shuffled index
      const currentShufflePosition = state.shuffledIndices.indexOf(state.currentSongIndex);
      const nextShufflePosition = (currentShufflePosition + 1) % state.playlist.length;
      nextIndex = state.shuffledIndices[nextShufflePosition];
    }
    
    const nextSong = state.playlist[nextIndex];
    return {
      currentSongIndex: nextIndex,
      status: { type: 'playing', song: nextSong }
    };
  }),
  
  playPrevious: () => set((state) => {
    if (state.playlist.length === 0) return state;
    
    let prevIndex = 0;
    
    if (state.playMode === 'standard' || state.playMode === 'repeat') {
      // Go to previous song or loop to the end if at the beginning
      prevIndex = state.currentSongIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.playMode === 'repeat' ? state.playlist.length - 1 : 0;
      }
    } else if (state.playMode === 'shuffle') {
      // In shuffle mode, find the previous shuffled index
      const currentShufflePosition = state.shuffledIndices.indexOf(state.currentSongIndex);
      const prevShufflePosition = (currentShufflePosition - 1 + state.playlist.length) % state.playlist.length;
      prevIndex = state.shuffledIndices[prevShufflePosition];
    }
    
    const prevSong = state.playlist[prevIndex];
    return {
      currentSongIndex: prevIndex,
      status: { type: 'playing', song: prevSong }
    };
  }),
  
  setPlayMode: (mode) => set((state) => {
    // If switching to shuffle mode, create shuffled indices
    if (mode === 'shuffle') {
      const indices = Array.from({ length: state.playlist.length }, (_, i) => i);
      const shuffledIndices = [...indices].sort(() => Math.random() - 0.5);
      return { playMode: mode, shuffledIndices };
    }
    return { playMode: mode };
  }),
  
  removeSongFromPlaylist: (index) => set((state) => {
    if (index < 0 || index >= state.playlist.length) return state;
    
    const newPlaylist = [...state.playlist];
    newPlaylist.splice(index, 1);
    
    if (newPlaylist.length === 0) {
      // If playlist is now empty
      return {
        playlist: [],
        currentSongIndex: 0,
        status: { type: 'idle' }
      };
    }
    
    // If the removed song was the current one or before it, adjust the index
    let newIndex = state.currentSongIndex;
    if (index === state.currentSongIndex) {
      // The current song was removed, play the next one
      if (newIndex >= newPlaylist.length) {
        newIndex = newPlaylist.length - 1;
      }
      return {
        playlist: newPlaylist,
        currentSongIndex: newIndex,
        status: { type: 'playing', song: newPlaylist[newIndex] }
      };
    } else if (index < state.currentSongIndex) {
      // A song before the current one was removed, adjust index
      newIndex = state.currentSongIndex - 1;
    }
    
    // Regenerate shuffled indices if needed
    let shuffledIndices = state.shuffledIndices;
    if (state.playMode === 'shuffle') {
      const indices = Array.from({ length: newPlaylist.length }, (_, i) => i);
      shuffledIndices = [...indices].sort(() => Math.random() - 0.5);
    }
    
    return {
      playlist: newPlaylist,
      currentSongIndex: newIndex,
      shuffledIndices
    };
  })
}));

export default usePlayerStore;
