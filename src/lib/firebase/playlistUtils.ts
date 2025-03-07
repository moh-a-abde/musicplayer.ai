import { auth, db, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove,
  orderBy,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Song } from '@/store/playerStore';
import { MusicFile } from './musicStorageUtils';

// Constants
const PLAYLISTS_COLLECTION = 'playlists';
const STORAGE_PLAYLIST_COVERS_PATH = 'playlist_covers';

// Interfaces
export interface Playlist {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  songIds: string[]; // Array of song IDs (references to music collection)
  isPublic: boolean; // Whether the playlist is public or private
}

// Firestore document interface (with Timestamp instead of Date)
interface FirestorePlaylist extends Omit<Playlist, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create a new playlist
 * 
 * @param playlistData The data for the new playlist
 * @returns A promise resolving to the created playlist
 */
export const createPlaylist = async (
  playlistData: Omit<Playlist, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'songIds'> & { songIds?: string[] }
): Promise<Playlist> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to create a playlist');
  }

  const now = new Date();
  
  const newPlaylist: Omit<Playlist, 'id'> = {
    userId,
    name: playlistData.name,
    description: playlistData.description || '',
    coverImage: playlistData.coverImage,
    createdAt: now,
    updatedAt: now,
    songIds: playlistData.songIds || [],
    isPublic: playlistData.isPublic || false
  };

  try {
    const docRef = await addDoc(collection(db, PLAYLISTS_COLLECTION), newPlaylist);
    return {
      ...newPlaylist,
      id: docRef.id
    };
  } catch (error: any) {
    throw new Error('Error creating playlist: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Get all playlists for the current user
 * 
 * @returns A promise resolving to an array of playlists
 */
export const getUserPlaylists = async (): Promise<Playlist[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to retrieve playlists');
  }

  try {
    const playlistsQuery = query(
      collection(db, PLAYLISTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(playlistsQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestorePlaylist;
      return {
        ...data,
        id: doc.id,
        // Convert Firestore timestamps to Date objects
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
  } catch (error: any) {
    throw new Error('Error retrieving playlists: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Get public playlists (for discovery feature in the future)
 * 
 * @returns A promise resolving to an array of public playlists
 */
export const getPublicPlaylists = async (): Promise<Playlist[]> => {
  try {
    const playlistsQuery = query(
      collection(db, PLAYLISTS_COLLECTION),
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(playlistsQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestorePlaylist;
      return {
        ...data,
        id: doc.id,
        // Convert Firestore timestamps to Date objects
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
  } catch (error: any) {
    throw new Error('Error retrieving public playlists: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Get a playlist by ID
 * 
 * @param playlistId The ID of the playlist to retrieve
 * @returns A promise resolving to the playlist or null if not found
 */
export const getPlaylistById = async (playlistId: string): Promise<Playlist | null> => {
  try {
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, playlistId);
    const playlistSnapshot = await getDoc(playlistRef);
    
    if (!playlistSnapshot.exists()) {
      return null;
    }
    
    const playlistData = playlistSnapshot.data() as FirestorePlaylist;
    
    // Check if the playlist is accessible to the current user
    const userId = auth.currentUser?.uid;
    if (!playlistData.isPublic && playlistData.userId !== userId) {
      throw new Error('You do not have permission to access this playlist');
    }
    
    return {
      ...playlistData,
      id: playlistId,
      // Convert Firestore timestamps to Date objects
      createdAt: playlistData.createdAt.toDate(),
      updatedAt: playlistData.updatedAt.toDate()
    };
  } catch (error: any) {
    throw new Error('Error retrieving playlist: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Update a playlist's metadata
 * 
 * @param playlistId The ID of the playlist to update
 * @param updates The updates to apply to the playlist
 * @returns A promise resolving to the updated playlist
 */
export const updatePlaylist = async (
  playlistId: string,
  updates: Partial<Omit<Playlist, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<Playlist> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to update a playlist');
  }

  try {
    // Check if the playlist exists and belongs to the current user
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, playlistId);
    const playlistSnapshot = await getDoc(playlistRef);
    
    if (!playlistSnapshot.exists()) {
      throw new Error('Playlist not found');
    }
    
    const playlistData = playlistSnapshot.data() as FirestorePlaylist;
    if (playlistData.userId !== userId) {
      throw new Error('You do not have permission to update this playlist');
    }
    
    // Update the playlist
    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await updateDoc(playlistRef, updatedData);
    
    // Get the updated playlist
    const updatedPlaylistSnapshot = await getDoc(playlistRef);
    const updatedPlaylist = updatedPlaylistSnapshot.data() as FirestorePlaylist;
    
    return {
      ...updatedPlaylist,
      id: playlistId,
      // Convert Firestore timestamps to Date objects
      createdAt: updatedPlaylist.createdAt.toDate(),
      updatedAt: updatedPlaylist.updatedAt.toDate()
    };
  } catch (error: any) {
    throw new Error('Error updating playlist: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Delete a playlist
 * 
 * @param playlistId The ID of the playlist to delete
 * @returns A promise that resolves when the playlist is deleted
 */
export const deletePlaylist = async (playlistId: string): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to delete a playlist');
  }

  try {
    // Check if the playlist exists and belongs to the current user
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, playlistId);
    const playlistSnapshot = await getDoc(playlistRef);
    
    if (!playlistSnapshot.exists()) {
      throw new Error('Playlist not found');
    }
    
    const playlistData = playlistSnapshot.data() as Playlist;
    if (playlistData.userId !== userId) {
      throw new Error('You do not have permission to delete this playlist');
    }
    
    // If the playlist has a cover image, delete it from storage
    if (playlistData.coverImage) {
      try {
        const imageUrl = new URL(playlistData.coverImage);
        const storageRef = ref(storage, imageUrl.pathname);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting playlist cover image:', error);
        // Continue with deletion even if image deletion fails
      }
    }
    
    // Delete the playlist document
    await deleteDoc(playlistRef);
  } catch (error: any) {
    throw new Error('Error deleting playlist: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Upload a cover image for a playlist
 * 
 * @param file The image file to upload
 * @param playlistId Optional playlist ID to organize storage structure
 * @returns A promise resolving to the download URL of the uploaded image
 */
export const uploadPlaylistCoverImage = async (
  file: File,
  playlistId?: string
): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to upload a playlist cover image');
  }

  try {
    // Create a well-organized path for the image
    const filename = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
    const idPath = playlistId ? `/${playlistId}` : '/new';
    const storagePath = `${STORAGE_PLAYLIST_COVERS_PATH}/${userId}${idPath}/${filename}`;
    
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    
    return getDownloadURL(storageRef);
  } catch (error: any) {
    throw new Error('Error uploading playlist cover image: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Add a song to a playlist
 * 
 * @param playlistId The ID of the playlist to add the song to
 * @param songId The ID of the song to add
 * @returns A promise resolving to the updated playlist
 */
export const addSongToPlaylist = async (
  playlistId: string,
  songId: string
): Promise<Playlist> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to add a song to a playlist');
  }

  try {
    // Check if the playlist exists and belongs to the current user
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, playlistId);
    const playlistSnapshot = await getDoc(playlistRef);
    
    if (!playlistSnapshot.exists()) {
      throw new Error('Playlist not found');
    }
    
    const playlistData = playlistSnapshot.data() as FirestorePlaylist;
    if (playlistData.userId !== userId) {
      throw new Error('You do not have permission to modify this playlist');
    }
    
    // Check if the song is already in the playlist
    if (playlistData.songIds?.includes(songId)) {
      // Song is already in the playlist, no action needed
      return {
        ...playlistData,
        id: playlistId,
        createdAt: playlistData.createdAt.toDate(),
        updatedAt: playlistData.updatedAt.toDate()
      };
    }
    
    // Add the song to the playlist
    await updateDoc(playlistRef, {
      songIds: arrayUnion(songId),
      updatedAt: new Date()
    });
    
    // Get the updated playlist
    const updatedPlaylistSnapshot = await getDoc(playlistRef);
    const updatedPlaylist = updatedPlaylistSnapshot.data() as FirestorePlaylist;
    
    return {
      ...updatedPlaylist,
      id: playlistId,
      createdAt: updatedPlaylist.createdAt.toDate(),
      updatedAt: updatedPlaylist.updatedAt.toDate()
    };
  } catch (error: any) {
    throw new Error('Error adding song to playlist: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Remove a song from a playlist
 * 
 * @param playlistId The ID of the playlist to remove the song from
 * @param songId The ID of the song to remove
 * @returns A promise resolving to the updated playlist
 */
export const removeSongFromPlaylist = async (
  playlistId: string,
  songId: string
): Promise<Playlist> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to remove a song from a playlist');
  }

  try {
    // Check if the playlist exists and belongs to the current user
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, playlistId);
    const playlistSnapshot = await getDoc(playlistRef);
    
    if (!playlistSnapshot.exists()) {
      throw new Error('Playlist not found');
    }
    
    const playlistData = playlistSnapshot.data() as FirestorePlaylist;
    if (playlistData.userId !== userId) {
      throw new Error('You do not have permission to modify this playlist');
    }
    
    // Remove the song from the playlist
    await updateDoc(playlistRef, {
      songIds: arrayRemove(songId),
      updatedAt: new Date()
    });
    
    // Get the updated playlist
    const updatedPlaylistSnapshot = await getDoc(playlistRef);
    const updatedPlaylist = updatedPlaylistSnapshot.data() as FirestorePlaylist;
    
    return {
      ...updatedPlaylist,
      id: playlistId,
      createdAt: updatedPlaylist.createdAt.toDate(),
      updatedAt: updatedPlaylist.updatedAt.toDate()
    };
  } catch (error: any) {
    throw new Error('Error removing song from playlist: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Reorder songs in a playlist
 * 
 * @param playlistId The ID of the playlist to reorder
 * @param newOrder An array of song IDs in the new order
 * @returns A promise resolving to the updated playlist
 */
export const reorderPlaylistSongs = async (
  playlistId: string,
  newOrder: string[]
): Promise<Playlist> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to reorder a playlist');
  }

  try {
    // Check if the playlist exists and belongs to the current user
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, playlistId);
    const playlistSnapshot = await getDoc(playlistRef);
    
    if (!playlistSnapshot.exists()) {
      throw new Error('Playlist not found');
    }
    
    const playlistData = playlistSnapshot.data() as FirestorePlaylist;
    if (playlistData.userId !== userId) {
      throw new Error('You do not have permission to modify this playlist');
    }
    
    // Validate that the new order contains the same songs
    const currentSongs = new Set(playlistData.songIds || []);
    const newSongs = new Set(newOrder);
    
    if (currentSongs.size !== newSongs.size) {
      throw new Error('The new order must contain all songs currently in the playlist');
    }
    
    // Convert to array to avoid Set iteration issues
    const currentSongsArray = Array.from(currentSongs);
    for (const songId of currentSongsArray) {
      if (!newSongs.has(songId)) {
        throw new Error('The new order must contain all songs currently in the playlist');
      }
    }
    
    // Update the playlist with the new order
    await updateDoc(playlistRef, {
      songIds: newOrder,
      updatedAt: new Date()
    });
    
    // Get the updated playlist
    const updatedPlaylistSnapshot = await getDoc(playlistRef);
    const updatedPlaylist = updatedPlaylistSnapshot.data() as FirestorePlaylist;
    
    return {
      ...updatedPlaylist,
      id: playlistId,
      createdAt: updatedPlaylist.createdAt.toDate(),
      updatedAt: updatedPlaylist.updatedAt.toDate()
    };
  } catch (error: any) {
    throw new Error('Error reordering playlist: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Get the list of songs in a playlist
 * 
 * @param playlistId The ID of the playlist to get songs from
 * @returns A promise resolving to an array of songs
 */
export const getPlaylistSongs = async (playlistId: string): Promise<MusicFile[]> => {
  try {
    // Get the playlist
    const playlist = await getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }
    
    if (playlist.songIds.length === 0) {
      return [];
    }
    
    // Get all music files for the songs in the playlist
    const musicFiles: MusicFile[] = [];
    
    for (const songId of playlist.songIds) {
      try {
        const musicRef = doc(db, 'music', songId);
        const musicSnapshot = await getDoc(musicRef);
        
        if (musicSnapshot.exists()) {
          musicFiles.push({
            ...musicSnapshot.data() as MusicFile,
            id: musicSnapshot.id
          });
        }
      } catch (error) {
        console.error(`Error fetching song ${songId}:`, error);
        // Continue with other songs even if one fails
      }
    }
    
    // Return the music files in the same order as in the playlist
    const orderedMusicFiles = playlist.songIds
      .map(songId => musicFiles.find(file => file.id === songId))
      .filter((file): file is MusicFile => !!file);
    
    return orderedMusicFiles;
  } catch (error: any) {
    throw new Error('Error retrieving playlist songs: ' + (error.message || 'Unknown error'));
  }
}; 