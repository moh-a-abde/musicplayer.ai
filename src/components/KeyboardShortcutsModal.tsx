'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCommand, FiArrowUp, FiArrowDown, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { Button } from './ui/button';

const shortcuts = [
  {
    key: 'Space',
    description: 'Play/Pause',
    keyDisplay: <div className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs">Space</div>
  },
  {
    key: 'ArrowRight',
    description: 'Next track',
    keyDisplay: <FiArrowRight className="h-5 w-5" />
  },
  {
    key: 'ArrowLeft',
    description: 'Previous track',
    keyDisplay: <FiArrowLeft className="h-5 w-5" />
  },
  {
    key: 'ArrowUp',
    description: 'Volume up',
    keyDisplay: <FiArrowUp className="h-5 w-5" />
  },
  {
    key: 'ArrowDown',
    description: 'Volume down',
    keyDisplay: <FiArrowDown className="h-5 w-5" />
  },
  {
    key: 'M',
    description: 'Mute/Unmute',
    keyDisplay: <div className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs">M</div>
  },
  {
    key: 'Shift+?',
    description: 'Show keyboard shortcuts',
    keyDisplay: (
      <div className="flex items-center gap-1">
        <div className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs">Shift</div>
        <span>+</span>
        <div className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs">?</div>
      </div>
    )
  }
];

export default function KeyboardShortcutsModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? to show/hide the modal
      if (e.key === '?' && e.shiftKey) {
        setIsVisible(prev => !prev);
      }
      
      // Escape key to close the modal
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  return (
    <>
      <div id="keyboard-shortcuts-modal" className={isVisible ? '' : 'hidden'}>
        <AnimatePresence>
          {isVisible && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsVisible(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-xl z-50 overflow-hidden border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Keyboard Shortcuts</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVisible(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-3">
                    {shortcuts.map((shortcut) => (
                      <div 
                        key={shortcut.key} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <span className="text-neutral-700 dark:text-neutral-300">{shortcut.description}</span>
                        <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                          {shortcut.keyDisplay}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                    Press <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs mx-1">Esc</kbd> to close
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
} 