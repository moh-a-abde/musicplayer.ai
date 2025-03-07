'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { MusicFile, updateMusicFileMetadata } from '@/lib/firebase/musicStorageUtils';
import { FiSave, FiX, FiMusic, FiUpload, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicMetadataEditorProps {
  music: MusicFile;
  onSave: (updatedMusic: MusicFile) => void;
  onCancel: () => void;
}

export default function MusicMetadataEditor({ music, onSave, onCancel }: MusicMetadataEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  
  // Editable metadata fields
  const [metadata, setMetadata] = useState({
    title: music.title || '',
    artist: music.artist || '',
    album: music.album || '',
    genre: music.genre || '',
    year: music.year,
  });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'year') {
      // Handle year field specially to ensure correct types
      const yearValue = value ? parseInt(value, 10) : undefined;
      setMetadata(prev => ({
        ...prev,
        year: yearValue
      }));
    } else {
      // Handle other string fields
      setMetadata(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle cover art file selection
  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverArtFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverArtPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare metadata update
      const updateData: Partial<MusicFile> = {
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        genre: metadata.genre,
        year: metadata.year,
      };
      
      // If there's a new cover art, we need to process it
      if (coverArtFile) {
        // For simplicity in this example, we'll just use the data URL from the preview
        // In a production app, you would upload the file to storage and get a proper URL
        updateData.coverArt = coverArtPreview || undefined;
      }
      
      // Update the metadata in Firestore
      const updatedMusic = await updateMusicFileMetadata(music.id!, updateData);
      
      // Show success state
      setSuccess(true);
      
      // Notify parent component
      setTimeout(() => {
        onSave(updatedMusic);
      }, 1000);
    } catch (err) {
      console.error('Error updating metadata:', err);
      setError(err instanceof Error ? err.message : 'Failed to update metadata');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Edit Metadata
        </h2>
        <button 
          onClick={onCancel}
          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
      
      <AnimatePresence>
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-neutral-900 dark:text-neutral-100">Metadata Updated</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your changes have been saved successfully.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Cover Art Preview & Upload */}
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative w-40 h-40 rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                  {(coverArtPreview || music.coverArt) ? (
                    <img 
                      src={coverArtPreview || music.coverArt} 
                      alt={metadata.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiMusic className="w-12 h-12 text-neutral-400" />
                    </div>
                  )}
                  
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCoverArtChange} 
                      className="sr-only" 
                    />
                    <div className="bg-white dark:bg-neutral-800 rounded-full p-2">
                      <FiUpload className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
                    </div>
                  </label>
                </div>
              </div>
              <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                Click on the image to upload new cover art
              </p>
            </div>
            
            {/* Title Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            {/* Artist Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Artist
              </label>
              <input
                type="text"
                name="artist"
                value={metadata.artist}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            {/* Album Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Album
              </label>
              <input
                type="text"
                name="album"
                value={metadata.album}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Genre Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Genre
              </label>
              <input
                type="text"
                name="genre"
                value={metadata.genre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Year Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={metadata.year || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="YYYY"
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
} 