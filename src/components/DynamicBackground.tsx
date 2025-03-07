'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import usePlayerStore from '@/store/playerStore';

interface DynamicBackgroundProps {
  color?: string;
  coverArt?: string;
  isPlaying?: boolean;
  audioData?: number[];
}

const DynamicBackground = ({ 
  color = 'rgb(79, 70, 229)', 
  coverArt,
  isPlaying = false,
  audioData = [] 
}: DynamicBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [bgOpacity, setBgOpacity] = useState(0.05);
  const requestRef = useRef<number | null>(null);
  
  // Particle class for canvas animations
  class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    baseSize: number;
    maxSize: number;
    
    constructor(canvas: HTMLCanvasElement) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.baseSize = Math.random() * 3 + 1;
      this.size = this.baseSize;
      this.maxSize = this.baseSize * 4;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      
      // Use the provided color with varying opacity
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const r = rgbValues[0];
        const g = rgbValues[1];
        const b = rgbValues[2];
        const opacity = Math.random() * 0.3 + 0.05; // Reduced opacity for better light mode appearance
        this.color = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else {
        this.color = `rgba(79, 70, 229, ${Math.random() * 0.3 + 0.05})`;
      }
    }
    
    update(intensity: number, canvas: HTMLCanvasElement, audioDataPoint: number) {
      // Move the particle
      this.x += this.speedX * intensity;
      this.y += this.speedY * intensity;
      
      // Respond to audio data
      this.size = this.baseSize + (audioDataPoint * (this.maxSize - this.baseSize));
      
      // Wrap around edges with a small buffer
      if (this.x > canvas.width + 10) this.x = -10;
      else if (this.x < -10) this.x = canvas.width + 10;
      
      if (this.y > canvas.height + 10) this.y = -10;
      else if (this.y < -10) this.y = canvas.height + 10;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  // Initialize canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match its display size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    setCanvasSize();
    
    // Create particles if they don't exist
    if (particlesRef.current.length === 0) {
      const particleCount = Math.min(50, Math.max(20, Math.floor((canvas.width * canvas.height) / 10000)));
      particlesRef.current = Array.from({ length: particleCount }, () => new Particle(canvas));
    }
    
    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      
      // Recreate particles for the new canvas size
      const particleCount = Math.min(50, Math.max(20, Math.floor((canvas.width * canvas.height) / 10000)));
      particlesRef.current = Array.from({ length: particleCount }, () => new Particle(canvas));
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [color]);
  
  // Animation loop for particles
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Detect if we're in light or dark mode (assume light mode for default)
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Animation loop for particles
    const animate = () => {
      // Create semi-transparent background for trail effect - lighter in light mode
      ctx.fillStyle = isDarkMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate average intensity from audio data
      const averageIntensity = audioData.length > 0
        ? audioData.reduce((sum, value) => sum + value, 0) / audioData.length
        : 0.5;
      
      // Update and draw each particle
      particlesRef.current.forEach((particle, index) => {
        // Use a specific data point for each particle, or fallback to average
        const dataIndex = index % audioData.length;
        const dataPoint = audioData[dataIndex] || averageIntensity;
        
        particle.update(averageIntensity + 0.5, canvas, dataPoint);
        particle.draw(ctx);
      });
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlaying, audioData]);
  
  // Adjust cover art background opacity based on playing state and light/dark mode
  useEffect(() => {
    // Use lower opacity in light mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    setBgOpacity(isPlaying ? (isDarkMode ? 0.12 : 0.08) : (isDarkMode ? 0.05 : 0.03));
  }, [isPlaying]);
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Canvas for particle effects */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Cover art background with blur effect */}
      {coverArt && (
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          animate={{ 
            opacity: bgOpacity,
            filter: `blur(${isPlaying ? 30 : 20}px)`
          }}
          transition={{ duration: 1 }}
          style={{
            backgroundImage: `url(${coverArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Color gradient overlay that pulses with the music */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none"
        animate={{ 
          opacity: isPlaying ? 
            [bgOpacity, bgOpacity * 1.5, bgOpacity] : 
            bgOpacity
        }}
        transition={{ 
          duration: 2, 
          repeat: isPlaying ? Infinity : 0,
          ease: "easeInOut"
        }}
        style={{
          background: `radial-gradient(circle at center, ${color.replace('rgb', 'rgba').replace(')', ', 0.3)')}, transparent 70%)`,
        }}
      />
      
      {/* Animated corner accents */}
      {isPlaying && (
        <>
          <motion.div 
            className="absolute top-0 right-0 w-1/3 h-1/3 opacity-10 dark:opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top right, ${color.replace('rgb', 'rgba').replace(')', ', 0.3)')}, transparent 70%)`,
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-1/3 h-1/3 opacity-10 dark:opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at bottom left, ${color.replace('rgb', 'rgba').replace(')', ', 0.3)')}, transparent 70%)`,
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}
    </div>
  );
};

export default DynamicBackground; 