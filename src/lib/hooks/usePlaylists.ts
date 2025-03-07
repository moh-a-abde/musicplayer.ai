'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  Playlist,
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  uploadPlaylistCoverImage,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs,
  getPlaylistSongs
} from '../firebase/playlistUtils';
import { MusicFile } from '../firebase/musicStorageUtils';
import usePlayerStore from '@/store/playerStore';

export const usePlaylists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const loadPlaylist = usePlayerStore(state => state.loadPlaylist);

  // Fetch all playlists for the current user
  const fetchPlaylists = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userPlaylists = await getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (err: any) {
      console.error('Error fetching playlists:', err);
      setError(err.message || 'Failed to fetch playlists');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch of playlists when component mounts or user changes
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Create a new playlist
  const createNewPlaylist = async (
    name: string,
    description?: string,
    coverFile?: File,
    isPublic: boolean = false
  ) => {
    try {
      setError(null);
      
      // Upload cover image if provided
      let coverImage;
      if (coverFile) {
        coverImage = await uploadPlaylistCoverImage(coverFile);
      }
      
      // Create the playlist
      const newPlaylist = await createPlaylist({
        name,
        description,
        coverImage,
        isPublic
      });
      
      // Update the local state
      setPlaylists(prev => [newPlaylist, ...prev]);
      
      return newPlaylist;
    } catch (err: any) {
      console.error('Error creating playlist:', err);
      setError(err.message || 'Failed to create playlist');
      throw err;
    }
  };

  // Update an existing playlist
  const updateExistingPlaylist = async (
    playlistId: string,
    updates: {
      name?: string;
      description?: string;
      coverFile?: File;
      isPublic?: boolean;
    }
  ) => {
    try {
      setError(null);
      
      const updateData: any = {};
      
      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }
      
      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }
      
      if (updates.isPublic !== undefined) {
        updateData.isPublic = updates.isPublic;
      }
      
      // Upload new cover image if provided
      if (updates.coverFile) {
        updateData.coverImage = await uploadPlaylistCoverImage(
          updates.coverFile,
          playlistId
        );
      }
      
      // Update the playlist
      const updatedPlaylist = await updatePlaylist(playlistId, updateData);
      
      // Update the local state
      setPlaylists(prev => 
        prev.map(p => (p.id === playlistId ? updatedPlaylist : p))
      );
      
      return updatedPlaylist;
    } catch (err: any) {
      console.error('Error updating playlist:', err);
      setError(err.message || 'Failed to update playlist');
      throw err;
    }
  };

  // Delete a playlist
  const removePlaylist = async (playlistId: string) => {
    try {
      setError(null);
      await deletePlaylist(playlistId);
      
      // Update the local state
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (err: any) {
      console.error('Error deleting playlist:', err);
      setError(err.message || 'Failed to delete playlist');
      throw err;
    }
  };

  // Add a song to a playlist
  const addSong = async (playlistId: string, songId: string) => {
    try {
      setError(null);
      const updatedPlaylist = await addSongToPlaylist(playlistId, songId);
      
      // Update the local state
      setPlaylists(prev => 
        prev.map(p => (p.id === playlistId ? updatedPlaylist : p))
      );
      
      return updatedPlaylist;
    } catch (err: any) {
      console.error('Error adding song to playlist:', err);
      setError(err.message || 'Failed to add song to playlist');
      throw err;
    }
  };

  // Remove a song from a playlist
  const removeSong = async (playlistId: string, songId: string) => {
    try {
      setError(null);
      const updatedPlaylist = await removeSongFromPlaylist(playlistId, songId);
      
      // Update the local state
      setPlaylists(prev => 
        prev.map(p => (p.id === playlistId ? updatedPlaylist : p))
      );
      
      return updatedPlaylist;
    } catch (err: any) {
      console.error('Error removing song from playlist:', err);
      setError(err.message || 'Failed to remove song from playlist');
      throw err;
    }
  };

  // Reorder songs in a playlist
  const reorderSongs = async (playlistId: string, newOrder: string[]) => {
    try {
      setError(null);
      const updatedPlaylist = await reorderPlaylistSongs(playlistId, newOrder);
      
      // Update the local state
      setPlaylists(prev => 
        prev.map(p => (p.id === playlistId ? updatedPlaylist : p))
      );
      
      return updatedPlaylist;
    } catch (err: any) {
      console.error('Error reordering playlist songs:', err);
      setError(err.message || 'Failed to reorder playlist songs');
      throw err;
    }
  };

  // Get detailed playlist with songs
  const getPlaylistWithSongs = async (playlistId: string) => {
    try {
      setError(null);
      const playlist = await getPlaylistById(playlistId);
      
      if (!playlist) {
        throw new Error('Playlist not found');
      }
      
      const songs = await getPlaylistSongs(playlistId);
      
      return {
        ...playlist,
        songs
      };
    } catch (err: any) {
      console.error('Error fetching playlist with songs:', err);
      setError(err.message || 'Failed to fetch playlist');
      throw err;
    }
  };

  // Play a playlist
  const playPlaylist = async (playlistId: string) => {
    try {
      setError(null);
      const { songs } = await getPlaylistWithSongs(playlistId);
      
      if (songs.length === 0) {
        throw new Error('Playlist is empty');
      }
      
      // Convert MusicFile objects to Song objects for the player
      const playerSongs = songs.map(song => ({
        url: song.url,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        coverArt: song.coverArt
      }));
      
      // Load the playlist into the player
      loadPlaylist(playerSongs, playlistId);
      
      return songs;
    } catch (err: any) {
      console.error('Error playing playlist:', err);
      setError(err.message || 'Failed to play playlist');
      throw err;
    }
  };

  return {
    playlists,
    isLoading,
    error,
    fetchPlaylists,
    createPlaylist: createNewPlaylist,
    updatePlaylist: updateExistingPlaylist,
    deletePlaylist: removePlaylist,
    addSongToPlaylist: addSong,
    removeSongFromPlaylist: removeSong,
    reorderPlaylistSongs: reorderSongs,
    getPlaylistWithSongs,
    playPlaylist
  };
}; 