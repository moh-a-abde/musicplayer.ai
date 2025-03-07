"use client";

import { useState, useRef, ChangeEvent } from "react";
import { usePlaylists } from "@/lib/hooks/usePlaylists";
import Image from "next/image";
import { PiUploadSimpleBold, PiXCircleFill } from "react-icons/pi";
import { BiLoaderAlt } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePlaylistModal = ({ isOpen, onClose }: CreatePlaylistModalProps) => {
  const { createPlaylist } = usePlaylists();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;
  
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
    const imageUrl = URL.createObjectURL(file);
    setCoverPreview(imageUrl);
    setError(null);
  };
  
  const handleRemoveCover = () => {
    setCoverFile(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await createPlaylist(name, description, coverFile || undefined, isPublic);
      
      // Reset form and close modal
      setName("");
      setDescription("");
      setIsPublic(false);
      handleRemoveCover();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create playlist");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Create New Playlist</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              aria-label="Close modal"
            >
              <PiXCircleFill className="text-2xl" />
            </Button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/60 rounded-md text-red-600 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add an optional description"
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveCover}
                      className="absolute top-1 right-1 bg-background/70 rounded-full p-1 text-foreground h-7 w-7"
                      aria-label="Remove cover image"
                    >
                      <PiXCircleFill className="text-lg" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-border/80 hover:text-foreground"
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
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm rounded-full"
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
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
                  className="w-4 h-4 bg-background border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">Make this playlist public</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Public playlists can be discovered and played by other users
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="rounded-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="rounded-full flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <BiLoaderAlt className="animate-spin text-lg" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Playlist</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePlaylistModal; 