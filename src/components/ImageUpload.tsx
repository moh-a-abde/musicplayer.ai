import React, { useState, useRef, useCallback } from "react";
import { Image as ImageIcon, X, Upload, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  className?: string;
}

export default function ImageUpload({ onImageChange, className = "" }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    // Reset previous errors
    setError(null);
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }
    
    // Check file type
    if (!file.type.match('image/(jpeg|jpg|png|gif|webp)')) {
      setError("Only JPEG, PNG, GIF, and WebP images are supported");
      return;
    }

    setIsLoading(true);
    onImageChange(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to read the file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const removeImage = () => {
    onImageChange(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <AnimatePresence mode="wait">
        {imagePreview ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-64"
          >
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              objectFit="cover"
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-colors"
              aria-label="Remove image"
            >
              <X size={18} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <label
              htmlFor="image"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 ${
                isDragging 
                  ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20" 
                  : "border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              } rounded-lg cursor-pointer transition-all duration-200`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-3"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Processing image...</p>
                  </div>
                ) : (
                  <>
                    <div className={`p-3 rounded-full mb-3 ${
                      isDragging 
                        ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400" 
                        : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    } transition-colors`}>
                      {isDragging ? (
                        <Upload className="w-8 h-8" />
                      ) : (
                        <ImageIcon className="w-8 h-8" />
                      )}
                    </div>
                    
                    {error ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <AlertCircle className="w-5 h-5 text-red-500 mr-1" />
                          <p className="text-sm font-medium text-red-500">Upload Failed</p>
                        </div>
                        <p className="text-xs text-red-500 mb-1">{error}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Please try again with a different file</p>
                      </div>
                    ) : (
                      <>
                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isDragging ? "Drop to upload" : "Click to upload"} or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          PNG, JPG, GIF or WebP (max 5MB)
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        type="file"
        id="image"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageChange}
        className="hidden"
        ref={fileInputRef}
      />
    </div>
  );
}
