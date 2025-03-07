import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';
import { PageTransition } from '@/components/PageTransition';
import { ToastProvider } from '@/components/ToastProvider';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import MusicPlayer from '@/components/MusicPlayer';
import { AppKeyboardShortcuts } from '@/components/AppKeyboardShortcuts';
import { AccessibilityAnnouncer } from '@/components/AccessibilityAnnouncer';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { MainNav } from '@/components/MainNav';
import Script from 'next/script';

// Use a fixed timestamp for cache busting to prevent hydration issues
const timestamp = '20240606001';

export const metadata = {
  title: 'musicplayer.ai',
  description: 'A modern music player with AI-powered features',
  icons: {
    icon: [
      { url: `/favicon.svg?v=${timestamp}`, type: 'image/svg+xml' },
      { url: `/icon.svg?v=${timestamp}`, type: 'image/svg+xml' },
    ],
    apple: `/icon.svg?v=${timestamp}`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Force refresh of icons */}
        <link rel="icon" href={`/favicon.svg?v=${timestamp}`} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={`/icon.svg?v=${timestamp}`} />
      </head>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300">
        {/* Script to force refresh icons */}
        <Script src={`/refresh-icons.js?v=${timestamp}`} strategy="beforeInteractive" />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider />
            <KeyboardShortcutsModal />
            <AppKeyboardShortcuts />
            <AccessibilityAnnouncer />
            <MainNav />
            <PageTransition>
              {children}
            </PageTransition>
            <MusicPlayer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
