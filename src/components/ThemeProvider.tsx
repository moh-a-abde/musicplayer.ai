"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from 'react';

export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState(false);
  
  // Add smooth transitions when theme changes
  useEffect(() => {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(`
      * {
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }
    `));
    document.head.appendChild(style);
    
    // Clean up the style on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Ensure we're only rendering the provider on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Use a div with the same structure to prevent layout shift
    return <div className="contents">{children}</div>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 