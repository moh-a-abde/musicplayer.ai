'use client';

import { useCallback, useEffect, useState } from 'react';
import usePlayerStore, { Song } from '@/store/playerStore';

// Define type for extracted metadata
interface ExtractedMetadata {
  title?: string;
  artist?: string;
  coverArt?: string;
  duration?: number;
  album?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  composer?: string;
  albumArtist?: string;
  lyrics?: string;
  comment?: string;
}

// This component will only be loaded client-side
export default function AudioMetadataExtractor({
  file,
  url,
  onComplete
}: {
  file: File;
  url: string;
  onComplete: (metadata: ExtractedMetadata) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(true);

  const extractMetadata = useCallback(async () => {
    // Basic metadata from filename
    const basicMetadata: ExtractedMetadata = {
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0
    };

    // Early return if not in browser environment
    if (typeof window === 'undefined') {
      onComplete(basicMetadata);
      return;
    }

    try {
      // Load jsmediatags dynamically only on client
      const jsmediatagsFn = await new Promise<any>(async (resolve) => {
        try {
          // Use a dynamic require with eval to prevent Next.js from trying to bundle this
          // during server-side rendering
          const jsmediatags = new Function('return import("jsmediatags")')()
            .then((module: any) => module.default);
          resolve(await jsmediatags);
        } catch (error) {
          console.error('Error importing jsmediatags:', error);
          resolve(null);
        }
      });

      if (jsmediatagsFn) {
        // Extract metadata using jsmediatags
        await new Promise<void>((resolve) => {
          jsmediatagsFn.read(file, {
            onSuccess: (tag: any) => {
              console.log('ID3 Tags extracted:', tag.tags);
              
              // Extract basic metadata
              if (tag.tags.title) {
                basicMetadata.title = tag.tags.title;
              }
              
              if (tag.tags.artist) {
                basicMetadata.artist = tag.tags.artist;
              }
              
              // Extract additional metadata
              if (tag.tags.album) {
                basicMetadata.album = tag.tags.album;
              }
              
              if (tag.tags.genre) {
                basicMetadata.genre = tag.tags.genre;
              }
              
              // Handle year with different tag names
              const year = tag.tags.year || tag.tags.date;
              if (year) {
                // Extract year from potential date formats like "2020" or "2020-01-01"
                const yearMatch = year.toString().match(/^\d{4}/);
                if (yearMatch) {
                  basicMetadata.year = parseInt(yearMatch[0], 10);
                }
              }
              
              // Extract track number
              if (tag.tags.track) {
                const trackStr = tag.tags.track.toString();
                const trackNum = parseInt(trackStr.split('/')[0], 10);
                if (!isNaN(trackNum)) {
                  basicMetadata.trackNumber = trackNum;
                }
              }
              
              // Extract additional metadata if available
              if (tag.tags.composer) {
                basicMetadata.composer = tag.tags.composer;
              }
              
              if (tag.tags.albumArtist) {
                basicMetadata.albumArtist = tag.tags.albumArtist;
              }
              
              if (tag.tags.lyrics) {
                basicMetadata.lyrics = tag.tags.lyrics;
              }
              
              if (tag.tags.comment) {
                basicMetadata.comment = tag.tags.comment.text || tag.tags.comment;
              }
              
              // Extract cover art if available
              if (tag.tags.picture) {
                const { data, format } = tag.tags.picture;
                const base64String = data.reduce((acc: string, byte: number) => {
                  return acc + String.fromCharCode(byte);
                }, '');
                basicMetadata.coverArt = `data:${format};base64,${window.btoa(base64String)}`;
              }
              
              resolve();
            },
            onError: (error: any) => {
              console.warn('Error extracting ID3 tags:', error);
              resolve(); // Continue even without metadata
            }
          });
        });
      }

      // Try to extract cover art via external APIs if not already available
      if (!basicMetadata.coverArt && 
          (basicMetadata.artist !== 'Unknown Artist' || 
           basicMetadata.title !== file.name.replace(/\.[^/.]+$/, ''))) {
        try {
          await fetchCoverArt(basicMetadata);
        } catch (e) {
          console.warn('Failed to fetch cover art from APIs:', e);
          // Continue without cover art from API
        }
      }

      // Generate a placeholder cover art if still none available
      if (!basicMetadata.coverArt) {
        basicMetadata.coverArt = generatePlaceholderCoverArt(basicMetadata);
      }

      // Get duration
      const audio = new Audio();
      audio.src = url;
      
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          basicMetadata.duration = audio.duration;
          resolve();
        };
        audio.onerror = () => resolve(); // Continue even if error
      });

      // Call the completion callback with all metadata
      onComplete(basicMetadata);
    } catch (error) {
      console.error('Error processing file metadata:', error);
      onComplete(basicMetadata);
    } finally {
      setIsProcessing(false);
    }
  }, [file, url, onComplete]);

  // Function to fetch cover art from multiple APIs
  const fetchCoverArt = async (metadata: ExtractedMetadata): Promise<void> => {
    // Skip if we don't have enough metadata
    if (!metadata.artist || !metadata.title) return;
    
    try {
      // First try LastFM API
      const lastFmCover = await fetchLastFmCoverArt(metadata);
      if (lastFmCover) {
        metadata.coverArt = lastFmCover;
        return;
      }
      
      // If LastFM fails, try iTunes/Apple Music
      const itunesCover = await fetchItunesCoverArt(metadata);
      if (itunesCover) {
        metadata.coverArt = itunesCover;
        return;
      }
      
      // If still no cover, try Discogs
      const discogsCover = await fetchDiscogsCoverArt(metadata);
      if (discogsCover) {
        metadata.coverArt = discogsCover;
      }
    } catch (error) {
      console.warn('Error fetching cover art from APIs:', error);
    }
  };
  
  // Function to fetch cover art from Last.fm
  const fetchLastFmCoverArt = async (metadata: ExtractedMetadata): Promise<string | null> => {
    try {
      // Note: In a real app, you would need to use your own API key
      // and implement the actual API call with proper authentication
      // This is a placeholder implementation
      const apiKey = 'YOUR_LASTFM_API_KEY';
      const artist = encodeURIComponent(metadata.artist || '');
      const track = encodeURIComponent(metadata.title || '');
      
      if (!artist || !track) return null;
      
      // Simulate API response for placeholder purposes
      // In production, you would make a real API call like:
      // const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${artist}&track=${track}&format=json`);
      
      // Instead, we'll just return null since this is a placeholder
      return null;
    } catch (error) {
      console.warn('Error fetching Last.fm cover art:', error);
      return null;
    }
  };
  
  // Function to fetch cover art from iTunes
  const fetchItunesCoverArt = async (metadata: ExtractedMetadata): Promise<string | null> => {
    try {
      const term = encodeURIComponent(`${metadata.artist} ${metadata.title}`);
      const response = await fetch(`https://itunes.apple.com/search?term=${term}&media=music&limit=1`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.resultCount === 0) return null;
      
      const result = data.results[0];
      // Get the artwork but replace the 100x100 with a larger size
      return result.artworkUrl100?.replace('100x100', '600x600') || null;
    } catch (error) {
      console.warn('Error fetching iTunes cover art:', error);
      return null;
    }
  };
  
  // Function to fetch cover art from Discogs
  const fetchDiscogsCoverArt = async (metadata: ExtractedMetadata): Promise<string | null> => {
    try {
      // Note: In a real app, you would need to use your own API key
      // and implement the actual API call with proper authentication
      // This is a placeholder implementation
      const artist = encodeURIComponent(metadata.artist || '');
      const release = encodeURIComponent(metadata.album || metadata.title || '');
      
      if (!artist || !release) return null;
      
      // Simulate API response for placeholder purposes
      // In production, you would make a real API call
      
      // Return null since this is a placeholder
      return null;
    } catch (error) {
      console.warn('Error fetching Discogs cover art:', error);
      return null;
    }
  };
  
  // Function to generate a placeholder cover art based on metadata
  const generatePlaceholderCoverArt = (metadata: ExtractedMetadata): string => {
    // Create a canvas to generate the placeholder
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    
    if (!ctx) return '';
    
    // Generate a background color based on the artist and title
    const hash = (metadata.artist || '') + (metadata.title || '');
    let hue = 0;
    for (let i = 0; i < hash.length; i++) {
      hue += hash.charCodeAt(i);
    }
    hue = hue % 360;
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, `hsl(${hue}, 80%, 40%)`);
    gradient.addColorStop(1, `hsl(${(hue + 40) % 360}, 80%, 60%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Draw text (first letter of artist and title)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const artistInitial = (metadata.artist || 'U')[0].toUpperCase();
    const titleInitial = (metadata.title || 'K')[0].toUpperCase();
    const text = `${artistInitial}${titleInitial}`;
    ctx.fillText(text, size / 2, size / 2);
    
    // Return as data URL
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  useEffect(() => {
    extractMetadata();
  }, [extractMetadata]);

  // This component doesn't render anything
  return null;
} 