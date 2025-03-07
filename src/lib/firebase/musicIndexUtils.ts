import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { MusicFile } from './musicStorageUtils';

const MUSIC_COLLECTION = 'music';
const MUSIC_INDEX_COLLECTION = 'music_index';

interface IndexEntry {
  id?: string;
  userId: string;
  musicId: string;
  field: string;
  value: string;
  timestamp: Date;
}

/**
 * Index music file metadata for faster searching
 * This creates searchable index entries in a separate collection
 * 
 * @param musicFile The music file to index
 * @returns A promise that resolves when indexing is complete
 */
export const indexMusicFile = async (musicFile: MusicFile): Promise<void> => {
  if (!musicFile.id) {
    console.error('Cannot index music file without an ID');
    return;
  }
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('User must be authenticated to index music');
    return;
  }
  
  try {
    // First, clean up any existing index entries for this music file
    await deleteIndexEntriesForMusic(musicFile.id);
    
    // Fields to index
    const fieldsToIndex: (keyof MusicFile)[] = ['title', 'artist', 'album', 'genre'];
    
    // Create index entries
    const indexPromises = fieldsToIndex.map(async (field) => {
      const value = musicFile[field];
      if (!value || typeof value !== 'string') return;
      
      // Index the exact value
      await addDoc(collection(db, MUSIC_INDEX_COLLECTION), {
        userId,
        musicId: musicFile.id,
        field,
        value: value.toLowerCase(),
        timestamp: new Date()
      });
      
      // Also index individual words for better search
      const words = value.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      for (const word of words) {
        await addDoc(collection(db, MUSIC_INDEX_COLLECTION), {
          userId,
          musicId: musicFile.id,
          field: `${field}_word`,
          value: word,
          timestamp: new Date()
        });
      }
    });
    
    await Promise.all(indexPromises);
  } catch (error) {
    console.error('Error indexing music file:', error);
    throw error;
  }
};

/**
 * Delete all index entries for a music file
 * 
 * @param musicId The ID of the music file to delete index entries for
 * @returns A promise that resolves when deletion is complete
 */
export const deleteIndexEntriesForMusic = async (musicId: string): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('User must be authenticated to delete index entries');
    return;
  }
  
  try {
    const indexQuery = query(
      collection(db, MUSIC_INDEX_COLLECTION),
      where('userId', '==', userId),
      where('musicId', '==', musicId)
    );
    
    const querySnapshot = await getDocs(indexQuery);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting index entries:', error);
    throw error;
  }
};

/**
 * Search for music files using the index
 * 
 * @param searchTerm The term to search for
 * @returns A promise resolving to an array of unique music IDs matching the search
 */
export const searchMusicIndex = async (searchTerm: string): Promise<string[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('User must be authenticated to search music index');
    return [];
  }
  
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  try {
    const normalizedTerm = searchTerm.toLowerCase().trim();
    const words = normalizedTerm.split(/\s+/).filter(word => word.length > 1);
    
    // Create queries for each word
    const queries = words.map(word => {
      // Search in all indexed fields
      return query(
        collection(db, MUSIC_INDEX_COLLECTION),
        where('userId', '==', userId),
        where('value', '>=', word),
        where('value', '<=', word + '\uf8ff') // End of Unicode range trick for prefix search
      );
    });
    
    // Execute all queries
    const queryResults = await Promise.all(
      queries.map(q => getDocs(q))
    );
    
    // Extract unique music IDs from results
    const musicIds = new Set<string>();
    
    queryResults.forEach(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        const data = doc.data() as IndexEntry;
        musicIds.add(data.musicId);
      });
    });
    
    return Array.from(musicIds);
  } catch (error) {
    console.error('Error searching music index:', error);
    return [];
  }
};

/**
 * Get unique values for a specific field from the index
 * Useful for building filter options like genre lists
 * 
 * @param field The field to get unique values for
 * @returns A promise resolving to an array of unique values
 */
export const getUniqueIndexValues = async (field: string): Promise<string[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('User must be authenticated to get unique index values');
    return [];
  }
  
  try {
    const indexQuery = query(
      collection(db, MUSIC_INDEX_COLLECTION),
      where('userId', '==', userId),
      where('field', '==', field),
      orderBy('value')
    );
    
    const querySnapshot = await getDocs(indexQuery);
    
    // Extract unique values
    const values = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data() as IndexEntry;
      values.add(data.value);
    });
    
    return Array.from(values);
  } catch (error) {
    console.error('Error getting unique index values:', error);
    return [];
  }
};

/**
 * Update the musicStorageUtils.ts file to integrate with indexing
 * by updating the updateMusicFileMetadata function to also update indexes
 */ 