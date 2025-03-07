'use client';

import React, { useEffect, useRef, useState } from 'react';
import usePlayerStore from '@/store/playerStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Maximize2,
  Minimize2,
  ListMusic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';
import { cn } from '@/lib/utils';
import { FiMusic } from 'react-icons/fi';
import { extractDominantColor } from '@/lib/utils';

const MusicPlayer = () => {
  const { 
    status, 
    volume, 
    playlist, 
    currentSongIndex, 
    setStatus, 
    setVolume, 
    setCurrentSongIndex 
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [coverArtLoaded, setCoverArtLoaded] = useState(false);
  const [visualizerColor, setVisualizerColor] = useState('rgb(59, 130, 246)');
  
  // Track background colors for dynamic theming
  const [primaryBgColor, setPrimaryBgColor] = useState('rgba(59, 130, 246, 0.15)');
  const [secondaryBgColor, setSecondaryBgColor] = useState('rgba(79, 70, 229, 0.05)');

  const [analyzerData, setAnalyzerData] = useState<number[]>(Array(64).fill(0));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const currentSong = playlist[currentSongIndex];

  // Initialize WaveSurfer with improved settings
  useEffect(() => {
    if (containerRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: 'rgba(79, 70, 229, 0.3)',
        progressColor: visualizerColor,
        cursorColor: 'transparent',
        barWidth: 2.5,
        barRadius: 2,
        cursorWidth: 0,
        height: 60,
        barGap: 1.5,
        normalize: true,
        barHeight: 0.8,
      });
    }

    // Update waveform colors when visualizer color changes
    if (wavesurferRef.current) {
      wavesurferRef.current.setOptions({
        progressColor: visualizerColor,
        waveColor: 'rgba(79, 70, 229, 0.3)', // Keep a consistent base color
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [visualizerColor]);

  // Update visualizer color based on cover art if available
  useEffect(() => {
    if (currentSong?.coverArt && coverArtLoaded) {
      // Extract dominant color from cover art and use it for the waveform
      const updateColor = async () => {
        try {
          const color = await extractDominantColor(currentSong.coverArt!);
          if (color) {
            // Use a more blue-focused color with a hint of purple
            const blueAccent = 'rgb(59, 130, 246)'; // Primarily blue
            setVisualizerColor(blueAccent);
            
            // Create more sophisticated background gradients for the expanded player
            setPrimaryBgColor('rgba(59, 130, 246, 0.15)'); // Blue primary
            setSecondaryBgColor('rgba(79, 70, 229, 0.05)'); // Hint of purple secondary

            // Create a CSS variable with the color to use for consistent theming
            const root = document.documentElement;
            root.style.setProperty('--music-player-accent', blueAccent);
          } else {
            setVisualizerColor('rgb(59, 130, 246)'); // Default blue if extraction fails
            setPrimaryBgColor('rgba(59, 130, 246, 0.15)');
            setSecondaryBgColor('rgba(79, 70, 229, 0.05)');
            
            // Reset to default color
            document.documentElement.style.setProperty('--music-player-accent', 'rgb(59, 130, 246)');
          }
        } catch (error) {
          console.error('Error extracting color:', error);
          setVisualizerColor('rgb(59, 130, 246)'); // Default blue on error
          setPrimaryBgColor('rgba(59, 130, 246, 0.15)');
          setSecondaryBgColor('rgba(79, 70, 229, 0.05)');
          
          // Reset to default color
          document.documentElement.style.setProperty('--music-player-accent', 'rgb(59, 130, 246)');
        }
      };
      
      updateColor();
    } else {
      setVisualizerColor('rgb(59, 130, 246)'); // Default blue when no cover art
      setPrimaryBgColor('rgba(59, 130, 246, 0.15)');
      setSecondaryBgColor('rgba(79, 70, 229, 0.05)');
      
      // Reset to default color
      document.documentElement.style.setProperty('--music-player-accent', 'rgb(59, 130, 246)');
    }
  }, [currentSong?.coverArt, coverArtLoaded]);

  // Update audio data for visualizer and dynamic background
  useEffect(() => {
    let animationFrame: number | undefined = undefined;
    
    if (status.type === 'playing' && audioRef.current) {
      try {
        // Initialize audio context on first user interaction
        // This must happen in response to a user gesture (like click)
        if (!audioContextRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContext();
          console.log("Audio context created with state:", audioContextRef.current.state);
          
          // Resume audio context if it's suspended
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().then(() => {
              console.log("Audio context resumed successfully");
            }).catch(err => {
              console.error("Failed to resume audio context:", err);
            });
          }
        }
        
        if (!analyserRef.current && audioContextRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256; // Increased for better resolution
          console.log("Analyser created successfully");
        }
        
        // Only create media source if it doesn't exist and audio context is available
        if (!sourceRef.current && audioRef.current && audioContextRef.current) {
          try {
            // Create media source from audio element
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            
            // Connect source → analyzer → destination
            if (analyserRef.current) {
              sourceRef.current.connect(analyserRef.current);
              analyserRef.current.connect(audioContextRef.current.destination);
              console.log("Media source created and connected successfully");
            } else {
              // If analyzer isn't available, connect directly to destination
              sourceRef.current.connect(audioContextRef.current.destination);
              console.log("Media source connected directly to destination (no analyzer)");
            }
          } catch (err) {
            console.warn('Could not create media element source:', err);
            
            // If the error is about the element already being connected, that's okay
            if (err instanceof DOMException && err.name === 'InvalidAccessError') {
              console.log("Audio element is already connected to a different AudioContext");
            }
            
            // If the audio context is suspended, try to resume it
            if (audioContextRef.current.state === 'suspended') {
              audioContextRef.current.resume().catch(error => {
                console.error("Failed to resume audio context:", error);
              });
            }
          }
        }
        
        // Resume audio context if it exists but is suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(err => {
            console.error("Failed to resume audio context during animation:", err);
          });
        }
        
        // Ensure we have an analyzer node before attempting to get data
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateData = () => {
          if (status.type !== 'playing' || !analyserRef.current) {
            if (animationFrame !== undefined) {
              cancelAnimationFrame(animationFrame);
            }
            return;
          }
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Convert to normalized values between 0-1
          const normalizedData = Array.from(dataArray).map(value => value / 255);
          setAnalyzerData(normalizedData);
          
          // Dispatch event with audio data for other components to use
          window.dispatchEvent(new CustomEvent('audioData', { 
            detail: normalizedData 
          }));
          
          animationFrame = requestAnimationFrame(updateData);
        };
        
        updateData();
      } catch (error) {
        console.error('Error setting up audio analyzer:', error);
      }
    } else if (status.type === 'paused' && audioContextRef.current) {
      // If paused and we have an audio context, suspend it to save resources
      if (audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(err => {
          console.error("Error suspending audio context:", err);
        });
      }
      
      // Cancel any running animation frames
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [status.type]);

  // Clean up audio context when component unmounts
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Reset refs
      sourceRef.current = null;
      analyserRef.current = null;
      audioContextRef.current = null;
    };
  }, []);

  // Update time display
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (wavesurferRef.current) {
        wavesurferRef.current.seekTo(audioRef.current.currentTime / duration);
      }
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (wavesurferRef.current) {
        // Fix the error - load the current song URL instead of the audio element
        wavesurferRef.current.load(currentSong.url);
      }
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0] * duration;
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        setVolume(prevVolume);
        audioRef.current.volume = prevVolume;
      } else {
        setPrevVolume(volume);
        setVolume(0);
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (status.type === 'playing') {
        console.log("Pausing audio");
        // Pause the audio element
        audioRef.current.pause();
        // Clean up any running animations
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          console.log("Suspending audio context");
          audioContextRef.current.suspend().catch(err => {
            console.error("Error suspending audio context:", err);
          });
        }
        // Update the UI state
        setStatus({ type: 'paused', song: currentSong });
      } else {
        console.log("Attempting to play audio:", currentSong?.url);
        
        // Make sure audio context is resumed (if it exists)
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          console.log("Resuming suspended audio context before playing");
          audioContextRef.current.resume().catch(err => {
            console.error("Failed to resume audio context:", err);
          });
        }
        
        // Check if audio source is valid
        if (!currentSong?.url) {
          console.error("Cannot play - no valid audio URL");
          return;
        }
        
        // Properly handle the play promise to catch errors
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
              console.log("Audio playback started successfully");
              setStatus({ type: 'playing', song: currentSong });
            })
            .catch(error => {
              // Auto-play was prevented or other error
              console.error("Error playing audio:", error.name, error.message);
              // Keep the UI in paused state
              setStatus({ type: 'paused', song: currentSong });
              
              // If it's an autoplay policy error, show a message or take other action
              if (error.name === 'NotAllowedError') {
                console.log("User interaction required to play audio - autoplay policy");
                // You could add UI to inform the user they need to interact first
              } else if (error.name === 'NotSupportedError') {
                console.error("Audio format or operation not supported:", currentSong?.url);
                // Check if this is a local file and the format is supported
              }
            });
        }
      }
    }
  };

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle previous song
  const handlePreviousSong = () => {
    if (playlist.length <= 1) return;
    const newIndex = currentSongIndex === 0 
      ? playlist.length - 1 
      : currentSongIndex - 1;
    setCurrentSongIndex(newIndex);
  };

  // Handle next song
  const handleNextSong = () => {
    if (playlist.length <= 1) return;
    const newIndex = isShuffleOn 
      ? Math.floor(Math.random() * playlist.length)
      : (currentSongIndex + 1) % playlist.length;
    setCurrentSongIndex(newIndex);
  };

  // Handle song end
  const handleSongEnd = () => {
    if (isRepeatOn && audioRef.current) {
      audioRef.current.currentTime = 0;
      
      // Properly handle the play promise
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing repeated audio:", error.message);
          setStatus({ type: 'paused', song: currentSong });
        });
      }
      return;
    }
    
    if (playlist.length > 1) {
      handleNextSong();
    } else if (playlist.length === 1 && audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isRepeatOn) {
        setStatus({ type: 'paused', song: currentSong });
      } else {
        // Properly handle the play promise
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing repeated audio:", error.message);
            setStatus({ type: 'paused', song: currentSong });
          });
        }
      }
    }
  };

  // Add this new useEffect to handle song changes and ensure audio element is properly set up
  useEffect(() => {
    if (audioRef.current && currentSong?.url) {
      console.log("Loading new song:", currentSong.url);
      
      // Clean up any previous audio setup
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
          sourceRef.current = null;
        } catch (err) {
          console.warn("Error disconnecting previous source:", err);
        }
      }
      
      // Set the source
      audioRef.current.src = currentSong.url;
      audioRef.current.volume = volume;
      
      // Preload the audio
      audioRef.current.load();
      
      // If status is playing, attempt to play
      if (status.type === 'playing') {
        console.log("Auto-playing new song...");
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error auto-playing new song:", error.name, error.message);
            // Update UI state if autoplay fails
            setStatus({ type: 'paused', song: currentSong });
          });
        }
      }
    }
  }, [currentSong, currentSongIndex]);

  // Render the minimized player controls
  const renderMinimizedPlayer = () => {
    return (
      <>
        {/* Progress bar at the top of the player */}
        <div className="h-0.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden absolute top-0 left-0">
          <div 
            className="h-full transition-all"
            style={{ 
              width: `${(currentTime / duration || 0) * 100}%`,
              backgroundColor: 'var(--music-player-accent, rgb(59, 130, 246))'
            }}
          />
        </div>
        
        <div className="flex items-center w-full justify-between gap-3 pt-1.5">
          {/* Left side: Cover art and title info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Cover Art (small) */}
            <motion.div 
              className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-md"
              animate={status.type === 'playing' ? {
                scale: [0.98, 1.02, 0.98]
              } : {}}
              transition={{ 
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut" 
              }}
            >
              {currentSong?.coverArt ? (
                <img 
                  src={currentSong.coverArt} 
                  alt={currentSong.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <FiMusic className="w-6 h-6 text-neutral-500" />
                </div>
              )}
              {status.type === 'playing' && (
                <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </motion.div>
            
            {/* Title & Artist */}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-base truncate text-neutral-900 dark:text-neutral-100">
                {currentSong?.title || "No track selected"}
              </h3>
              <div className="flex items-center">
                <p className="text-xs truncate text-neutral-500 dark:text-neutral-400 mr-2">
                  {currentSong?.artist || "Unknown Artist"}
                </p>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side: Playback controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousSong}
              disabled={playlist.length <= 1}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 h-8 w-8 rounded-full"
              aria-label="Previous song"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant={status.type === 'playing' ? "default" : "outline"}
              size="icon"
              onClick={togglePlayPause}
              disabled={!currentSong}
              className={cn(
                "h-12 w-12 rounded-full transition-all shadow-sm",
                status.type === 'playing' 
                  ? "text-white shadow-md" 
                  : "text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
              )}
              style={
                status.type === 'playing' 
                ? { backgroundColor: 'var(--music-player-accent, rgb(59, 130, 246))' } 
                : {}
              }
              aria-label={status.type === 'playing' ? 'Pause' : 'Play'}
            >
              {status.type === 'playing' ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextSong}
              disabled={playlist.length <= 1}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 h-8 w-8 rounded-full"
              aria-label="Next song"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(true)}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 h-8 w-8 rounded-full ml-1"
              aria-label="Expand player"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Render playback controls for expanded view
  const renderPlaybackControls = () => {
    return (
      <div className="flex flex-col w-full space-y-3">
        {/* Time information & slider */}
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <Slider
          value={[currentTime / duration || 0]}
          min={0}
          max={1}
          step={0.001}
          onValueChange={handleSeek}
          className="cursor-pointer mb-3"
          aria-label="Playback progress"
        />
        
        {/* Main controls row with enhanced styling */}
        <div className="flex items-center justify-between px-2">
          {/* Left controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setIsShuffleOn(!isShuffleOn) }}
              className={cn(
                "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 rounded-full transition-colors",
                isShuffleOn && "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              )}
              style={isShuffleOn ? { color: 'var(--music-player-accent, rgb(59, 130, 246))' } : {}}
              aria-label={isShuffleOn ? "Disable shuffle" : "Enable shuffle"}
              aria-pressed={isShuffleOn}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Center controls */}
          <div className="flex items-center space-x-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousSong}
              disabled={playlist.length <= 1}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white disabled:opacity-50 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 rounded-full transition-colors w-10 h-10"
              aria-label="Previous song"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant={status.type === 'playing' ? "default" : "outline"}
              size="icon"
              onClick={togglePlayPause}
              disabled={!currentSong}
              className={cn(
                "h-16 w-16 rounded-full transition-all shadow-md",
                status.type === 'playing' 
                  ? "text-white shadow-lg hover:scale-105 transition-transform" 
                  : "text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
              )}
              style={
                status.type === 'playing' 
                ? { backgroundColor: 'var(--music-player-accent, rgb(59, 130, 246))' } 
                : {}
              }
              aria-label={status.type === 'playing' ? 'Pause' : 'Play'}
            >
              {status.type === 'playing' ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="h-7 w-7 ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextSong}
              disabled={playlist.length <= 1}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white disabled:opacity-50 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 rounded-full transition-colors w-10 h-10"
              aria-label="Next song"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Right controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setIsRepeatOn(!isRepeatOn) }}
              className={cn(
                "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 rounded-full transition-colors",
                isRepeatOn && "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              )}
              style={isRepeatOn ? { color: 'var(--music-player-accent, rgb(59, 130, 246))' } : {}}
              aria-label={isRepeatOn ? "Disable repeat" : "Enable repeat"}
              aria-pressed={isRepeatOn}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Volume control with enhanced styling */}
        <div className="flex items-center space-x-3 pt-4 px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className={cn(
              "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 rounded-full h-8 w-8 transition-colors",
              (volume === 0 || isMuted) && "text-neutral-400 dark:text-neutral-500"
            )}
            aria-label={volume === 0 || isMuted ? "Unmute" : "Mute"}
            aria-pressed={volume === 0 || isMuted}
          >
            {volume === 0 || isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-32 cursor-pointer"
            aria-label="Volume"
          />
          <div className="w-10 text-xs text-right text-neutral-600 dark:text-neutral-400 font-medium">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </div>
        </div>
      </div>
    );
  };

  // Only render player if there's a song in the playlist
  if (playlist.length === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={expanded ? "expanded" : "minimized"}
        initial={expanded 
          ? { opacity: 0, scale: 0.95 } 
          : { opacity: 0, y: 20 }
        }
        animate={expanded 
          ? { opacity: 1, scale: 1 } 
          : { opacity: 1, y: 0 }
        }
        exit={expanded 
          ? { opacity: 0, scale: 0.95 } 
          : { opacity: 0, y: 20 }
        }
        transition={{ 
          duration: 0.25, 
          ease: [0.25, 0.1, 0.25, 1.0],
          opacity: { duration: 0.15 },
          scale: { duration: 0.3 },
          y: { duration: 0.2 }
        }}
        className={cn(
          "fixed z-50 pointer-events-none",
          expanded 
            ? "inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-6" 
            : "bottom-0 left-0 right-0 p-2 md:p-4"
        )}
      >
        <motion.div
          layout
          layoutRoot
          transition={{
            layout: { 
              duration: 0.3, 
              ease: [0.25, 0.1, 0.25, 1.0],
              type: "spring",
              stiffness: 400,
              damping: 40
            }
          }}
          className="w-full max-w-3xl mx-auto"
        >
          <Card className={cn(
            "overflow-hidden transition-all duration-200 shadow-lg border border-neutral-200/70 dark:border-neutral-800/70 pointer-events-auto w-full relative",
            expanded 
              ? "rounded-2xl max-h-[90vh] flex flex-col" 
              : "rounded-xl"
          )}
          style={{
            background: expanded 
              ? `linear-gradient(135deg, ${primaryBgColor}, ${secondaryBgColor})` 
              : '',
            backdropFilter: 'blur(12px)',
            boxShadow: expanded 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 24px -8px rgba(0, 0, 0, 0.15)' 
              : '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
          >
            <CardContent className={cn(
              "transition-all duration-200 backdrop-blur-md relative z-10",
              expanded 
                ? "p-6 flex flex-col h-full overflow-auto bg-white/95 dark:bg-black/85" 
                : "p-3 pt-3.5 relative bg-white/98 dark:bg-black/95"
            )}>
              {expanded ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col w-full h-full space-y-6 relative z-20"
                >
                  {/* Top Bar with close button */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpanded(false)}
                      className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 relative z-30 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-full"
                    >
                      <Minimize2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Main content area - prominently features cover art */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Album art - large and centered with enhanced styling */}
                    <motion.div 
                      className="relative mb-8"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="w-60 h-60 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900 relative">
                        {currentSong?.coverArt ? (
                          <motion.img 
                            src={currentSong.coverArt} 
                            alt={currentSong.title} 
                            className="w-full h-full object-cover"
                            onLoad={() => setCoverArtLoaded(true)}
                            onError={() => setCoverArtLoaded(false)}
                            initial={{ scale: 1.05, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <FiMusic className="w-24 h-24 text-neutral-400 dark:text-neutral-600" />
                          </div>
                        )}
                        
                        {/* Add subtle reflection effect */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50 pointer-events-none"
                          aria-hidden="true"
                        />
                      </div>
                      
                      {/* Add subtle shadow beneath the album art */}
                      <div 
                        className="absolute -bottom-4 left-1/2 w-4/5 h-4 -translate-x-1/2 blur-xl bg-black/20 rounded-full"
                        aria-hidden="true"
                      />
                    </motion.div>
                    
                    {/* Track details - centered below cover art */}
                    <motion.h2 
                      className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 leading-tight text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentSong?.title || "No track selected"}
                    </motion.h2>
                    
                    <motion.p 
                      className="text-xl text-neutral-600 dark:text-neutral-300 mb-6 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentSong?.artist || "Unknown Artist"}
                    </motion.p>
                    
                    {/* Waveform - displayed nicely inside expanded view */}
                    <div className="w-full relative pointer-events-none mt-4 mb-8">
                      <div ref={containerRef} className="w-full h-20 rounded-lg overflow-hidden" />
                    </div>
                  </div>
    
                  {/* Playback Controls - enhanced styling */}
                  <div className="mt-auto pt-4 relative z-30 bg-white/50 dark:bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-neutral-800/30 shadow-sm">
                    {renderPlaybackControls()}
                  </div>
    
                  {/* Playlist Toggle - enhanced styling */}
                  <div className="flex items-center justify-center mt-2 relative z-30">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPlaylist(!showPlaylist)}
                      className={cn(
                        "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-full",
                        showPlaylist && "text-primary-600 dark:text-primary-500"
                      )}
                    >
                      <ListMusic className="h-5 w-5 mr-2" />
                      {showPlaylist ? "Hide Playlist" : "Show Playlist"}
                    </Button>
                  </div>
    
                  {/* Playlist - enhanced styling */}
                  {showPlaylist && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white/90 dark:bg-black/70 max-h-64 relative z-30 shadow-md"
                    >
                      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 font-medium text-sm flex justify-between items-center">
                        <span>Playlist ({playlist.length} songs)</span>
                        {playlist.length > 0 && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatTime(playlist.reduce((acc, song) => acc + (song.duration || 0), 0))} total
                          </span>
                        )}
                      </div>
                      <div className="overflow-y-auto max-h-[calc(64px*4)]">
                        {playlist.map((song, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setCurrentSongIndex(idx)}
                            className={cn(
                              "flex items-center gap-3 p-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors",
                              currentSongIndex === idx ? "bg-primary-50 dark:bg-primary-900/20" : ""
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-md flex items-center justify-center overflow-hidden",
                              currentSongIndex === idx ? "bg-primary-100 dark:bg-primary-900/30" : "bg-neutral-200 dark:bg-neutral-700"
                            )}>
                              {song.coverArt ? (
                                <img 
                                  src={song.coverArt} 
                                  alt={song.title} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                currentSongIndex === idx && status.type === 'playing' ? (
                                  <Pause className="h-4 w-4 text-primary-600 dark:text-primary-500" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-neutral-900 dark:text-neutral-100">
                                {song.title}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                {song.artist}
                              </div>
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                              {formatTime(song.duration || 0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderMinimizedPlayer()}
                </motion.div>
              )}

              <audio
                ref={audioRef}
                src={currentSong?.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleSongEnd}
                onError={(e) => {
                  console.error("Audio element error:", (e.target as HTMLAudioElement).error);
                  setStatus({ type: 'paused', song: currentSong });
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;
