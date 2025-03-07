import { auth, storage, db } from './firebase';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  listAll, 
  deleteObject, 
  StorageReference 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { Song } from '@/store/playerStore';
import { indexMusicFile, deleteIndexEntriesForMusic } from './musicIndexUtils';

// Constants
const MUSIC_COLLECTION = 'music';
const STORAGE_MUSIC_BASE_PATH = 'music';

// Interfaces
export interface MusicFile extends Song {
  id?: string;
  userId: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  storageLocation: string;
  album?: string;
  genre?: string;
  year?: number;
}

export interface UploadProgressCallback {
  (progress: number, bytesTransferred: number, totalBytes: number): void;
}

export interface UploadTask {
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

/**
 * Upload a music file to Firebase Storage with progress tracking
 * 
 * @param file The music file to upload
 * @param metadata The metadata for the music file
 * @param onProgress Callback function for tracking upload progress
 * @returns A promise resolving to the uploaded music file data
 */
export const uploadMusicFile = async (
  file: File, 
  metadata: Partial<MusicFile>, 
  onProgress?: UploadProgressCallback
): Promise<MusicFile> => {
  // Ensure user is authenticated
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to upload music');
  }

  // Create a well-organized path for the music file
  // Format: music/{userId}/{artist}/{album}/{filename}
  const artist = (metadata.artist || 'Unknown Artist').replace(/[^a-z0-9]/gi, '_');
  const album = (metadata.album || 'Unknown Album').replace(/[^a-z0-9]/gi, '_');
  const filename = file.name.replace(/[^a-z0-9.]/gi, '_');
  
  const storagePath = `${STORAGE_MUSIC_BASE_PATH}/${userId}/${artist}/${album}/${filename}`;
  const storageRef = ref(storage, storagePath);

  // Create upload task with progress tracking
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Define promise for handling the upload
  const uploadPromise = new Promise<MusicFile>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        // Upload complete, get download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Create record in Firestore
        const musicFileData: MusicFile = {
          userId,
          url: downloadURL,
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
          artist: metadata.artist || 'Unknown Artist',
          album: metadata.album || 'Unknown Album',
          duration: metadata.duration || 0,
          coverArt: metadata.coverArt || undefined,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date(),
          storageLocation: storagePath,
          genre: metadata.genre || undefined,
          year: metadata.year || undefined
        };
        
        // Add the document to Firestore
        const docRef = await addDoc(collection(db, MUSIC_COLLECTION), musicFileData);
        
        // Create the complete music file data with the document ID
        const completeMusicFile = {
          ...musicFileData,
          id: docRef.id
        };
        
        // Index the music file for search
        try {
          await indexMusicFile(completeMusicFile);
        } catch (indexError) {
          console.error('Error indexing music file:', indexError);
          // Continue even if indexing fails
        }
        
        // Return the complete music file data with the document ID
        resolve(completeMusicFile);
      }
    );
  });

  // Return an object that combines the promise with control methods
  const task: UploadTask = {
    cancel: () => uploadTask.cancel(),
    pause: () => uploadTask.pause(),
    resume: () => uploadTask.resume()
  };

  // Attach the task to the promise for external control
  (uploadPromise as any).task = task;
  
  return uploadPromise;
};

/**
 * Get all music files for the current user
 * 
 * @returns A promise resolving to an array of music file data
 */
export const getUserMusicFiles = async (): Promise<MusicFile[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to retrieve music files');
  }

  const musicQuery = query(
    collection(db, MUSIC_COLLECTION),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(musicQuery);
  return querySnapshot.docs.map(doc => ({
    ...doc.data() as MusicFile,
    id: doc.id
  }));
};

/**
 * Get music files filtered by metadata
 * 
 * @param filter Object containing metadata fields to filter by
 * @returns A promise resolving to an array of filtered music file data
 */
export const getMusicFilesByFilter = async (
  filter: Partial<MusicFile>
): Promise<MusicFile[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to retrieve music files');
  }

  let musicQuery = query(
    collection(db, MUSIC_COLLECTION),
    where('userId', '==', userId)
  );

  // Apply additional filters
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      musicQuery = query(musicQuery, where(key, '==', value));
    }
  });

  const querySnapshot = await getDocs(musicQuery);
  return querySnapshot.docs.map(doc => ({
    ...doc.data() as MusicFile,
    id: doc.id
  }));
};

/**
 * Delete a music file from both Storage and Firestore
 * 
 * @param musicFileId The ID of the music file to delete
 * @returns A promise that resolves when the file is deleted
 */
export const deleteMusicFile = async (musicFileId: string): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to delete music files');
  }

  // Get the music file data from Firestore
  const musicRef = doc(db, MUSIC_COLLECTION, musicFileId);
  const musicSnapshot = await getDocs(query(
    collection(db, MUSIC_COLLECTION),
    where('id', '==', musicFileId),
    where('userId', '==', userId)
  ));

  if (musicSnapshot.empty) {
    throw new Error('Music file not found or not owned by current user');
  }

  const musicFile = musicSnapshot.docs[0].data() as MusicFile;

  try {
    // Delete the file from Storage
    const storageRef = ref(storage, musicFile.storageLocation);
    await deleteObject(storageRef);
    
    // Delete index entries
    await deleteIndexEntriesForMusic(musicFileId);

    // Delete the document from Firestore
    await deleteDoc(doc(db, MUSIC_COLLECTION, musicFileId));
  } catch (error: any) {
    throw new Error('Error deleting music file: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Update music file metadata
 * 
 * @param musicFileId The ID of the music file to update
 * @param metadata The metadata fields to update
 * @returns A promise that resolves to the updated music file data
 */
export const updateMusicFileMetadata = async (
  musicFileId: string,
  metadata: Partial<MusicFile>
): Promise<MusicFile> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to update music files');
  }

  // Ensure the user owns the music file
  const musicQuery = query(
    collection(db, MUSIC_COLLECTION),
    where('id', '==', musicFileId),
    where('userId', '==', userId)
  );
  
  const musicSnapshot = await getDocs(musicQuery);
  
  if (musicSnapshot.empty) {
    throw new Error('Music file not found or not owned by current user');
  }

  // Remove fields that shouldn't be updated directly
  const { id, userId: _, storageLocation, uploadedAt, fileSize, fileType, url, ...validMetadata } = metadata;
  
  // Update the document in Firestore
  const docRef = doc(db, MUSIC_COLLECTION, musicFileId);
  await updateDoc(docRef, validMetadata);
  
  // Get the updated document
  const updatedDoc = await getDocs(query(
    collection(db, MUSIC_COLLECTION),
    where('id', '==', musicFileId)
  ));
  
  const updatedMusic = {
    ...updatedDoc.docs[0].data() as MusicFile,
    id: musicFileId
  };
  
  // Re-index the updated music file
  try {
    await indexMusicFile(updatedMusic);
  } catch (indexError) {
    console.error('Error re-indexing music file:', indexError);
    // Continue even if re-indexing fails
  }
  
  return updatedMusic;
};

/**
 * Get unique values for a specific metadata field across user's music collection
 * Useful for generating filter options like all artists, albums, genres, etc.
 * 
 * @param field The metadata field to get unique values for
 * @returns A promise resolving to an array of unique values
 */
export const getUniqueMusicFileMetadata = async (
  field: keyof MusicFile
): Promise<string[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to retrieve music metadata');
  }

  const musicQuery = query(
    collection(db, MUSIC_COLLECTION),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(musicQuery);
  const values = new Set<string>();
  
  querySnapshot.docs.forEach(doc => {
    const data = doc.data() as MusicFile;
    if (data[field] && typeof data[field] === 'string') {
      values.add(data[field] as string);
    }
  });
  
  return Array.from(values);
}; 