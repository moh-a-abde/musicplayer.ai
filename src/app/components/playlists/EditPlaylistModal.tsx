"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { usePlaylists } from "@/lib/hooks/usePlaylists";
import { Playlist } from "@/lib/firebase/playlistUtils";
import Image from "next/image";
import { PiUploadSimpleBold, PiXCircleFill } from "react-icons/pi";
import { BiLoaderAlt } from "react-icons/bi";

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist | null;
}

const EditPlaylistModal = ({ isOpen, onClose, playlist }: EditPlaylistModalProps) => {
  const { updatePlaylist } = usePlaylists();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form with playlist data when it changes
  useEffect(() => {
    if (playlist) {
      setName(playlist.name);
      setDescription(playlist.description || "");
      setIsPublic(playlist.isPublic);
      
      if (playlist.coverImage) {
        setCoverPreview(playlist.coverImage);
      } else {
        setCoverPreview(null);
      }
    }
  }, [playlist]);
  
  if (!isOpen || !playlist) return null;
  
  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    
    // Check if the file size is under 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be under 5MB");
      return;
    }
    
    setCoverFile(file);
    
    // If there's an existing cover preview from the playlist (not from a file), clear it
    if (coverPreview && !coverFile) {
      setCoverPreview(null);
    }
    
    const imageUrl = URL.createObjectURL(file);
    setCoverPreview(imageUrl);
    setError(null);
  };
  
  const handleRemoveCover = () => {
    setCoverFile(null);
    
    // If there's a file-based preview, revoke the URL to prevent memory leaks
    if (coverFile && coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    
    // Clear the preview (whether it's from a file or the original playlist)
    setCoverPreview(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }
    
    if (!playlist.id) {
      setError("Playlist ID is missing");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare updates object
      const updates: {
        name?: string;
        description?: string;
        coverFile?: File;
        coverImage?: string;
        isPublic?: boolean;
      } = {};
      
      // Only include fields that have changed
      if (name !== playlist.name) {
        updates.name = name;
      }
      
      if (description !== (playlist.description || "")) {
        updates.description = description;
      }
      
      if (isPublic !== playlist.isPublic) {
        updates.isPublic = isPublic;
      }
      
      // Handle cover image changes
      if (coverFile) {
        updates.coverFile = coverFile;
      } else if (playlist.coverImage && !coverPreview) {
        // If the original playlist had a cover but now coverPreview is null,
        // it means the user removed the cover
        updates.coverImage = ""; // Empty string to indicate removal
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await updatePlaylist(playlist.id, updates);
      }
      
      // Clear file input and reset file state
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setCoverFile(null);
      
      // Close the modal
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update playlist");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="bg-neutral-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-neutral-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Edit Playlist</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <PiXCircleFill className="text-2xl" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800/60 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add an optional description"
                rows={3}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Cover Image
              </label>
              
              <div className="mt-1 flex items-center gap-4">
                {coverPreview ? (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full p-1 text-white"
                      aria-label="Remove cover image"
                    >
                      <PiXCircleFill className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-neutral-600 rounded-md flex flex-col items-center justify-center text-neutral-400 cursor-pointer hover:border-neutral-500 hover:text-neutral-300"
                  >
                    <PiUploadSimpleBold className="text-2xl mb-1" />
                    <span className="text-xs">Upload</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCoverChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                  >
                    Choose File
                  </button>
                  <p className="text-xs text-neutral-400 mt-1">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="w-4 h-4 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-neutral-300">Make this playlist public</span>
              </label>
              <p className="text-xs text-neutral-400 mt-1">
                Public playlists can be discovered and played by other users
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <BiLoaderAlt className="animate-spin text-lg" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistModal; 