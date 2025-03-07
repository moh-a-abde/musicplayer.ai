import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  className?: string;
  textSize?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'gradient' | 'white' | 'futuristic';
  animationType?: 'bounce' | 'wave' | 'pulse' | 'glow' | 'none';
  interactive?: boolean;
}

export function AnimatedLogo({ 
  className = "", 
  textSize = "md", 
  color = "default",
  animationType = "bounce",
  interactive = false
}: AnimatedLogoProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Text size classes
  const sizeClasses = {
    sm: "text-lg font-medium tracking-wide",
    md: "text-xl font-medium tracking-wide",
    lg: "text-2xl font-semibold tracking-wide"
  };
  
  // Color classes
  const colorClasses = {
    default: "text-primary-600 dark:text-primary-400",
    gradient: "bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 dark:from-primary-500 dark:via-primary-400 dark:to-secondary-500 bg-clip-text text-transparent",
    white: "text-white",
    futuristic: "bg-gradient-to-r from-primary-600 via-cyan-500 to-secondary-600 dark:from-primary-500 dark:via-cyan-400 dark:to-secondary-500 bg-clip-text text-transparent"
  };
  
  // Animation variants
  const getAnimationVariant = (type: string) => {
    switch (type) {
      case 'bounce':
        return {
          initial: { y: 0 },
          animate: {
            y: [0, -3, 0],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse" as const,
              repeatDelay: 3
            }
          },
          hover: {
            y: -5,
            scale: 1.2,
            transition: { duration: 0.2 }
          }
        };
      case 'wave':
        return {
          initial: { y: 0 },
          animate: (i: number) => ({
            y: [0, -5, 0],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse" as const,
              repeatDelay: 0.1,
              delay: i * 0.05
            }
          }),
          hover: {
            y: -5,
            color: "#3b82f6",
            transition: { duration: 0.2 }
          }
        };
      case 'pulse':
        return {
          initial: { scale: 1 },
          animate: {
            scale: [1, 1.1, 1],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse" as const,
              repeatDelay: 2
            }
          },
          hover: {
            scale: 1.3,
            transition: { duration: 0.2 }
          }
        };
      case 'glow':
        return {
          initial: { 
            textShadow: "0 0 0px rgba(59, 130, 246, 0)" 
          },
          animate: {
            textShadow: [
              "0 0 0px rgba(59, 130, 246, 0)",
              "0 0 10px rgba(59, 130, 246, 0.5)",
              "0 0 0px rgba(59, 130, 246, 0)"
            ],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" as const
            }
          },
          hover: {
            scale: 1.1,
            textShadow: "0 0 8px rgba(59, 130, 246, 0.7)",
            transition: { duration: 0.2 }
          }
        };
      default:
        return {
          initial: {},
          animate: {},
          hover: {
            scale: 1.2,
            transition: { duration: 0.2 }
          }
        };
    }
  };
  
  // Split the text into individual letters
  const text = "musicplayer.ai";
  const letters = Array.from(text);
  
  // Get the appropriate animation variant
  const animationVariant = getAnimationVariant(animationType);
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[textSize]} ${colorClasses[color]} flex`}>
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial="initial"
            whileHover={interactive ? "hover" : undefined}
            onHoverStart={() => interactive && setHoveredIndex(i)}
            onHoverEnd={() => interactive && setHoveredIndex(null)}
            className="inline-block relative"
            style={{ 
              originX: '20%', 
              originY: '20%' 
            }}
            custom={i}
          >
            <motion.span
              initial={animationVariant.initial}
              animate={animationType !== 'none' ? 
                typeof animationVariant.animate === 'function' 
                  ? animationVariant.animate(i) 
                  : animationVariant.animate 
                : undefined}
              whileHover={interactive ? animationVariant.hover : undefined}
              transition={{ 
                delay: i * 0.05,
                ...(animationType === 'wave' ? { 
                  repeat: Infinity,
                  repeatType: "reverse" as const,
                  repeatDelay: 5
                } : {})
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
            {interactive && hoveredIndex === i && (
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-500 dark:to-secondary-500 rounded-full"
                layoutId="letter-underline"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.span>
        ))}
      </div>
    </div>
  );
} 