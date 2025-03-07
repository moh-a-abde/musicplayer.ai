'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function ToastProvider() {
  const { theme } = useTheme();
  
  return (
    <Toaster
      position="bottom-center"
      theme={theme as 'light' | 'dark' | 'system'}
      closeButton
      richColors
      toastOptions={{
        style: {
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        },
        className: 'font-medium',
        duration: 2000,
      }}
    />
  );
} 