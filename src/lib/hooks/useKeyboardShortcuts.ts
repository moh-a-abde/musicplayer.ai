'use client';

import { useEffect } from 'react';
import usePlayerStore from '@/store/playerStore';
import { toast } from 'sonner';

type KeyboardAction = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  showToast?: boolean;
};

const useKeyboardShortcuts = () => {
  const { 
    status, 
    playlist,
    currentSongIndex,
    setStatus,
    setCurrentSongIndex 
  } = usePlayerStore();

  useEffect(() => {
    // Define all keyboard shortcuts
    const keyboardActions: KeyboardAction[] = [
      {
        key: ' ',
        description: 'Play/Pause',
        showToast: true,
        action: () => {
          if (!playlist[currentSongIndex]) return;
          
          if (status.type === 'playing') {
            setStatus({ type: 'paused', song: playlist[currentSongIndex] });
          } else {
            setStatus({ type: 'playing', song: playlist[currentSongIndex] });
          }
        }
      },
      {
        key: 'ArrowRight',
        description: 'Next track',
        showToast: true,
        action: () => {
          if (!playlist.length) return;
          
          const nextIndex = currentSongIndex >= playlist.length - 1 ? 0 : currentSongIndex + 1;
          setCurrentSongIndex(nextIndex);
        }
      },
      {
        key: 'ArrowLeft',
        description: 'Previous track',
        showToast: true,
        action: () => {
          if (!playlist.length) return;
          
          const prevIndex = currentSongIndex <= 0 ? playlist.length - 1 : currentSongIndex - 1;
          setCurrentSongIndex(prevIndex);
        }
      },
      {
        key: 'm',
        description: 'Mute/Unmute',
        showToast: true,
        action: () => {
          const audio = document.querySelector('audio');
          if (audio) {
            audio.muted = !audio.muted;
          }
        }
      },
      {
        key: 'ArrowUp',
        description: 'Volume up',
        action: () => {
          const audio = document.querySelector('audio');
          if (audio && audio.volume < 0.95) {
            audio.volume = Math.min(1, audio.volume + 0.05);
          }
        }
      },
      {
        key: 'ArrowDown',
        description: 'Volume down',
        action: () => {
          const audio = document.querySelector('audio');
          if (audio && audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.05);
          }
        }
      },
      {
        key: '?',
        shift: true,
        description: 'Show keyboard shortcuts',
        showToast: true,
        action: () => {
          // Show a modal with all shortcuts
          // This will be implemented separately
          document.getElementById('keyboard-shortcuts-modal')?.classList.remove('hidden');
        }
      }
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Find matching keyboard action
      const action = keyboardActions.find(action => {
        const keyMatches = action.key === e.key;
        const ctrlMatches = action.ctrl ? e.ctrlKey : !e.ctrlKey;
        const altMatches = action.alt ? e.altKey : !e.altKey;
        const shiftMatches = action.shift ? e.shiftKey : !e.shiftKey;
        
        return keyMatches && ctrlMatches && altMatches && shiftMatches;
      });

      if (action) {
        e.preventDefault();
        action.action();
        
        // Show toast notification for the action
        if (action.showToast) {
          toast(`${action.description}`, {
            position: 'bottom-center',
            duration: 1500,
          });
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSongIndex, playlist, setCurrentSongIndex, setStatus, status.type]);

  return null;
};

export default useKeyboardShortcuts; 