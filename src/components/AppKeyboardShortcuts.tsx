'use client';

import { useEffect } from 'react';
import useKeyboardShortcuts from '@/lib/hooks/useKeyboardShortcuts';

export function AppKeyboardShortcuts() {
  // This component just uses the hook without rendering anything
  useKeyboardShortcuts();
  
  return null;
} 