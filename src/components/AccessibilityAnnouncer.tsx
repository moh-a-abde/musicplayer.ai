'use client';

import { useEffect, useState } from 'react';
import usePlayerStore from '@/store/playerStore';

export function AccessibilityAnnouncer() {
  const [announcement, setAnnouncement] = useState('');
  const { status, playlist, currentSongIndex } = usePlayerStore();
  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    // Create announcements based on player status changes
    if (status.type === 'playing' && currentSong) {
      setAnnouncement(`Now playing: ${currentSong.title} by ${currentSong.artist}`);
    } else if (status.type === 'paused' && currentSong) {
      setAnnouncement(`Paused: ${currentSong.title}`);
    } else if (status.type === 'error') {
      setAnnouncement(`Error: ${status.error}`);
    }
    
    // Clear announcement after 5 seconds
    const timer = setTimeout(() => {
      setAnnouncement('');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [status, currentSong]);

  // Hidden visually but announced by screen readers
  return (
    <div 
      aria-live="polite" 
      aria-atomic="true" 
      className="sr-only"
    >
      {announcement}
    </div>
  );
} 