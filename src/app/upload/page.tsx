'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiMusic, FiCheck, FiInfo, FiLoader, FiFile, FiAlertTriangle } from 'react-icons/fi';
import usePlayerStore from '@/store/playerStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Button, Progress } from '@/components/ui';
import { uploadMusicFile, MusicFile, UploadTask } from '@/lib/firebase/musicStorageUtils';
import { useAuth } from '@/lib/hooks/useAuth';

// Define type for tag data
interface TagData {
  title?: string;
  artist?: string;
  coverArt?: string;
  duration?: number;
  album?: string;
  genre?: string;
  year?: number;
}

// Import AudioMetadataExtractor component with client-side only loading
const AudioMetadataExtractor = dynamic(
  () => import('@/components/AudioMetadataExtractor'),
  { ssr: false }
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Define interface for processing file type
interface ProcessingFile {
  file: File;
  url: string;
  processed: boolean;
  task?: UploadTask;
  uploadProgress: number;
  error?: string;
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);
  
  const addToPlaylist = usePlayerStore(state => state.addToPlaylist);
  const loadPlaylist = usePlayerStore(state => state.loadPlaylist);
  const playlist = usePlayerStore(state => state.playlist);
  const router = useRouter();
  const { user } = useAuth();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleMetadataExtracted = async (index: number, metadata: TagData) => {
    const fileInfo = processingFiles[index];
    
    try {
      // Upload the file to Firebase Storage with the extracted metadata
      const uploadedMusic = await uploadMusicFile(
        fileInfo.file,
        {
          title: metadata.title,
          artist: metadata.artist,
          coverArt: metadata.coverArt,
          duration: metadata.duration,
          album: metadata.album,
          genre: metadata.genre,
          year: metadata.year
        },
        (progress) => {
          // Update upload progress
          const updatedFiles = [...processingFiles];
          updatedFiles[index].uploadProgress = progress;
          setProcessingFiles(updatedFiles);
        }
      );

      // Add the processed song to the playlist
      if (playlist.length === 0) {
        // If playlist is empty, load the song and start playing
        loadPlaylist([{
          url: uploadedMusic.url,
          title: uploadedMusic.title,
          artist: uploadedMusic.artist,
          coverArt: uploadedMusic.coverArt,
          duration: uploadedMusic.duration
        }]);
      } else {
        // If playlist has songs, just add to it
        addToPlaylist({
          url: uploadedMusic.url,
          title: uploadedMusic.title,
          artist: uploadedMusic.artist,
          coverArt: uploadedMusic.coverArt,
          duration: uploadedMusic.duration
        });
      }

      // Mark this file as processed
      const updatedFiles = [...processingFiles];
      updatedFiles[index].processed = true;
      updatedFiles[index].url = uploadedMusic.url; // Update with storage URL
      setProcessingFiles(updatedFiles);

      // Update overall progress
      const processedCount = updatedFiles.filter(f => f.processed).length;
      setProcessingProgress(Math.round((processedCount / updatedFiles.length) * 100));

      // Check if all files are processed
      if (processedCount === updatedFiles.length) {
        setIsProcessing(false);
        setProcessingProgress(100);
        setUploadSuccess(true);
        setTimeout(() => {
          router.push('/recommendations');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      // Update file with error
      const updatedFiles = [...processingFiles];
      updatedFiles[index].error = error.message || 'Error uploading file';
      updatedFiles[index].processed = true; // Mark as processed to continue with other files
      setProcessingFiles(updatedFiles);
      
      // Update progress anyway
      const processedCount = updatedFiles.filter(f => f.processed).length;
      setProcessingProgress(Math.round((processedCount / updatedFiles.length) * 100));
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!user) {
      alert('You must be signed in to upload music files');
      return;
    }
    
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length > 0) {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      // Prepare file processing list
      const filesToProcess = audioFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        processed: false,
        uploadProgress: 0
      }));
      
      setProcessingFiles(filesToProcess);
    }
  };

  const cancelUpload = (index: number) => {
    const fileToCancel = processingFiles[index];
    
    // Cancel the upload task if it exists
    if (fileToCancel.task) {
      fileToCancel.task.cancel();
    }
    
    // Update the files array
    const updatedFiles = [...processingFiles];
    updatedFiles.splice(index, 1);
    setProcessingFiles(updatedFiles);
    
    // If no files left, reset the processing state
    if (updatedFiles.length === 0) {
      setIsProcessing(false);
    } else {
      // Recalculate progress
      const processedCount = updatedFiles.filter(f => f.processed).length;
      setProcessingProgress(Math.round((processedCount / updatedFiles.length) * 100));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Visual Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl dark:bg-primary-400/10"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-secondary-400/20 rounded-full filter blur-3xl dark:bg-secondary-400/10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl dark:bg-primary-400/10"></div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4"
            >
              Upload Your Music
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-neutral-600 dark:text-neutral-300"
            >
              Add your audio files to enhance your music experience
            </motion.p>
          </div>
          
          {/* Dropzone */}
          <motion.div
            ref={dropAreaRef}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              dragActive 
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                : "border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600",
              isProcessing && "opacity-50 pointer-events-none"
            )}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDrop={handleDrop}
          >
            <motion.div variants={itemVariants} className="mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                <FiUpload className="w-8 h-8 text-primary-500" />
              </div>
            </motion.div>
            
            <motion.h3 
              variants={itemVariants}
              className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50"
            >
              Drag & Drop Audio Files
            </motion.h3>
            
            <motion.p 
              variants={itemVariants}
              className="text-neutral-600 dark:text-neutral-400 mb-6"
            >
              or click to browse your files
            </motion.p>
            
            <motion.div variants={itemVariants}>
              <label className="inline-flex">
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileInput}
                  className="sr-only"
                  disabled={isProcessing}
                />
                <Button
                  variant="gradient"
                  size="lg"
                  className="cursor-pointer rounded-md"
                  disabled={isProcessing}
                >
                  <FiMusic className="mr-2" />
                  Select Audio Files
                </Button>
              </label>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-6 flex items-center justify-center"
            >
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
              >
                <FiInfo className="mr-1" />
                <span>Upload Tips</span>
              </button>
            </motion.div>
            
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left text-sm"
                >
                  <h4 className="font-semibold mb-2">For best results:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>MP3, WAV, FLAC formats are recommended</li>
                    <li>Make sure files have proper metadata for automatic organization</li>
                    <li>Files will be stored in your personal music library</li>
                    <li>Large files may take longer to upload and process</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Processing and Upload Status */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
              >
                <h3 className="text-lg font-semibold mb-4">Processing Files</h3>
                
                <div className="space-y-4">
                  {processingFiles.map((file, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <FiMusic className="text-primary-500" />
                          <span className="font-medium truncate max-w-[200px]">{file.file.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {!file.processed && (
                            <button 
                              onClick={() => cancelUpload(index)} 
                              className="text-xs text-red-500 hover:text-red-700 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          
                          {file.processed && !file.error && (
                            <FiCheck className="text-green-500" />
                          )}
                          
                          {file.error && (
                            <div className="flex items-center text-red-500">
                              <FiAlertTriangle className="mr-1" />
                              <span className="text-xs">{file.error}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Progress 
                        value={file.processed ? 100 : file.uploadProgress} 
                        className="h-2 bg-neutral-200 dark:bg-neutral-700"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold">{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-3 bg-neutral-200 dark:bg-neutral-700" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Metadata Extractors (hidden) */}
          <div className="sr-only">
            {processingFiles.map((fileInfo, index) => (
              <AudioMetadataExtractor
                key={index}
                file={fileInfo.file}
                url={fileInfo.url}
                onComplete={(metadata) => handleMetadataExtracted(index, metadata)}
              />
            ))}
          </div>
          
          {/* Success Message */}
          <AnimatePresence>
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
              >
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-xl max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Upload Complete!</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                    Your music files have been successfully uploaded.
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Redirecting to recommendations...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
