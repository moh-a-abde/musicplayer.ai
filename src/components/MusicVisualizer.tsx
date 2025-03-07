'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import usePlayerStore from '@/store/playerStore';
import { cn } from '@/lib/utils';

// Constants for visualizer configuration
const NUM_BARS = 64;

// Visualization modes
type VisualizerMode = 'bars' | 'circle' | 'wave';

interface MusicVisualizerProps {
  color?: string;
  mode?: VisualizerMode;
}

export default function MusicVisualizer({ 
  color = 'rgb(79, 70, 229)', 
  mode = 'bars' 
}: MusicVisualizerProps) {
  const { status } = usePlayerStore();
  const [analyzerData, setAnalyzerData] = useState<number[]>(Array(NUM_BARS).fill(0));
  const [activeMode, setActiveMode] = useState<VisualizerMode>(mode);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const didSetUpRef = useRef<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect color scheme on mount and when it changes
  useEffect(() => {
    const detectColorScheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    detectColorScheme();
    
    // Create MutationObserver to watch for class changes on html element for theme toggles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          detectColorScheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  // Apply the mode prop when it changes
  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  // Create audio analyzer 
  useEffect(() => {
    if (didSetUpRef.current) return;

    // Get reference to the audio element
    audioRef.current = document.querySelector('audio');
    if (!audioRef.current) return;

    try {
      // Set up canvas for advanced visualizations if needed
      if (canvasRef.current && (mode === 'circle' || mode === 'wave')) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set proper canvas dimensions
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          
          // Listen for resize events to adjust canvas size
          const handleResize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
          };
          
          window.addEventListener('resize', handleResize);
          return () => window.removeEventListener('resize', handleResize);
        }
      }
      } catch (error) {
      console.error('Error setting up canvas:', error);
    }

    didSetUpRef.current = true;
  }, [mode]);

  // Listen for audio data updates
  useEffect(() => {
    // Create a listener for custom events containing audio data
    const handleAudioDataUpdate = (event: CustomEvent) => {
      if (event.detail && Array.isArray(event.detail)) {
        setAnalyzerData(event.detail);
      }
    };

    // Add event listener for audio data updates
    window.addEventListener('audioData' as any, handleAudioDataUpdate as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('audioData' as any, handleAudioDataUpdate as EventListener);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Auto-generate visualization data if none is being received
  useEffect(() => {
    if (status.type !== 'playing') return;
    
    // Only generate fake data if we're not getting real data
    if (analyzerData.every(val => val === 0)) {
      const generateFakeData = () => {
        const newData = analyzerData.map(() => {
          // Generate a value between 0.1 and 0.8 with some randomness
          return Math.min(0.8, Math.max(0.1, Math.random() * 0.7 + 0.1));
        });
        setAnalyzerData(newData);
        animationRef.current = requestAnimationFrame(generateFakeData);
      };
      
      generateFakeData();
      
      return () => {
        cancelAnimationFrame(animationRef.current);
      };
    }
  }, [status.type, analyzerData]);

  // If there's no audio playing, render a placeholder
  if (status.type !== 'playing') {
    return (
      <div className="w-full h-24 flex items-center justify-center">
        <p className="text-neutral-400 dark:text-neutral-500 text-sm">Play a song to see visualizer</p>
      </div>
    );
  }

  // Helper function to get combined colors for gradients
  const getColorGradient = (opacity = 1) => {
    // Parse the color to get RGB values
    const rgbMatch = color.match(/\d+/g);
    if (!rgbMatch || rgbMatch.length < 3) return `rgba(79, 70, 229, ${opacity})`;
    
    const r = parseInt(rgbMatch[0], 10);
    const g = parseInt(rgbMatch[1], 10);
    const b = parseInt(rgbMatch[2], 10);
    
    // Create a complementary or similar color
    const r2 = Math.min(255, r + 50);
    const g2 = Math.min(255, g + 30);
    const b2 = Math.min(255, b + 40);
    
    return `linear-gradient(180deg, rgba(${r},${g},${b},${opacity}) 0%, rgba(${r2},${g2},${b2},${opacity}) 100%)`;
  };

  // Render different visualizer modes
  switch (activeMode) {
    case 'circle':
      return (
        <div className="w-full h-40 flex items-center justify-center overflow-hidden py-2 pointer-events-none">
          {/* Backdrop blur and glow effect */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ filter: 'blur(40px)' }}>
            <div 
              className="absolute inset-0 rounded-full transform pointer-events-none" 
              style={{ 
                background: getColorGradient(0.5),
                top: '30%',
                left: '40%',
                width: '30%',
                height: '30%'
              }} 
            />
          </div>
          
          <div className="relative w-40 h-40">
            {/* Center dot */}
            <motion.div 
              className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full z-10 pointer-events-none"
              style={{ 
                backgroundColor: color,
                marginLeft: '-6px',
                marginTop: '-6px',
                boxShadow: `0 0 10px ${color}`
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ 
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            />

            {/* Circular particles */}
            {analyzerData.map((value, index) => {
              const angle = (index / NUM_BARS) * 2 * Math.PI;
              const radius = 60; // Base radius
              const amplitude = value * 30; // Scale factor for visualization
              const x = Math.cos(angle) * (radius + amplitude);
              const y = Math.sin(angle) * (radius + amplitude);
              const size = Math.max(2, value * 6);

  return (
        <motion.div
          key={index}
                  className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: color,
                    left: 'calc(50% - 3px)',
                    top: 'calc(50% - 3px)',
                    boxShadow: `0 0 ${value * 10}px ${color.replace('rgb', 'rgba').replace(')', ', 0.7)')}`,
                  }}
                  animate={{
                    x,
                    y,
                    scale: size / 3,
                    opacity: Math.min(1, value + 0.2)
                  }}
          transition={{
            type: 'spring',
                    stiffness: 100,
            damping: 10,
            mass: 0.1
          }}
        />
              );
            })}
            
            {/* Connecting lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              {analyzerData.map((value, index) => {
                if (index % 4 !== 0) return null; // Only draw some lines
                
                const angle = (index / NUM_BARS) * 2 * Math.PI;
                const radius = 60; 
                const amplitude = value * 30;
                const x = Math.cos(angle) * (radius + amplitude) + 70;
                const y = Math.sin(angle) * (radius + amplitude) + 70;
                
                return (
                  <line 
                    key={`line-${index}`}
                    x1="70" 
                    y1="70" 
                    x2={x} 
                    y2={y}
                    stroke={color}
                    strokeWidth="0.5"
                    strokeOpacity={value}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      );

    case 'wave':
      return (
        <div className="w-full h-32 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="relative w-full px-4">
            {/* Wave SVG visualizer */}
            <svg 
              width="100%" 
              height="80" 
              viewBox="0 0 1200 100" 
              preserveAspectRatio="none"
              className="text-neutral-900 dark:text-white pointer-events-none"
            >
              {/* First wave - filled */}
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              <motion.path
                d={`M 0,50 ${analyzerData.map((value, index) => {
                  const x = (index / (NUM_BARS - 1)) * 1200;
                  const y = 50 - (value * 40);
                  return `L ${x},${y}`;
                }).join(' ')} L 1200,50 L 1200,100 L 0,100 Z`}
                fill="url(#waveGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: isDarkMode ? 1 : 0.7 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Second wave - just the line */}
              <motion.path
                d={`M 0,50 ${analyzerData.map((value, index) => {
                  const x = (index / (NUM_BARS - 1)) * 1200;
                  const y = 50 - (value * 40);
                  return `L ${x},${y}`;
                }).join(' ')} L 1200,50`}
                stroke={color}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Reflection wave - mirrored and faded */}
              <motion.path
                d={`M 0,50 ${analyzerData.map((value, index) => {
                  const x = (index / (NUM_BARS - 1)) * 1200;
                  const y = 50 + (value * 20); // Mirrored
                  return `L ${x},${y}`;
                }).join(' ')} L 1200,50`}
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.3"
                fill="none"
              />
              
              {/* Highlight dots at peaks */}
              {analyzerData.filter((_, i) => i % 8 === 0).map((value, idx) => {
                const realIdx = idx * 8;
                const x = (realIdx / (NUM_BARS - 1)) * 1200;
                const y = 50 - (value * 40);
                
                return (
                  <motion.circle
                    key={`peak-${idx}`}
                    cx={x}
                    cy={y}
                    r={value * 3 + 1}
                    fill={color}
                    animate={{ 
                      r: [value * 3 + 1, value * 4 + 2, value * 3 + 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 1 + value,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </svg>
            
            {/* Horizontal line with glow effect */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
              style={{ 
                backgroundImage: `linear-gradient(90deg, ${color.replace('rgb', 'rgba').replace(')', ', 0)')} 0%, ${color} 50%, ${color.replace('rgb', 'rgba').replace(')', ', 0)')} 100%)`,
                boxShadow: `0 0 10px ${color}`
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
        </div>
      );

    case 'bars':
    default:
      // Calculate intensity for glow effects
      const maxValue = Math.max(...analyzerData, 0.1);
      const intensity = status.type === 'playing' ? Math.min(1, maxValue * 1.5) : 0.5;
      
      return (
        <div className="w-full h-24 flex items-end justify-center gap-[1px] px-4 py-2 overflow-hidden pointer-events-none">
          {/* Backdrop glow effect */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ 
              background: getColorGradient(intensity),
              filter: 'blur(20px)'
            }}
          />
          
          {/* Visualizer bars */}
          {analyzerData.map((value, index) => {
            // Calculate bar height with minimum value
            const height = Math.max(3, value * 100);
            // Calculate bar width based on mode
            const barWidth = 3;
            
            return (
              <motion.div
                key={index}
                className="relative rounded-t pointer-events-none"
                style={{ 
                  height: `${height}%`,
                  width: `${barWidth}px`,
                  background: getColorGradient(isDarkMode ? 0.9 : 0.7),
                  boxShadow: `0 0 ${value * 15}px ${color.replace('rgb', 'rgba').replace(')', ', 0.5)')}`,
                }}
                initial={{ height: 0 }}
                animate={{ 
                  height: `${height}%`,
                  opacity: Math.max(0.4, value)
                }}
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 15,
                  mass: 0.1
                }}
              >
                {/* Bright top of the bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t pointer-events-none" 
                  style={{ 
                    background: color, 
                    boxShadow: `0 0 5px ${color}`
                  }} 
                />
              </motion.div>
            );
          })}
    </div>
  );
  }
} 