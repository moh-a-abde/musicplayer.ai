"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

type MusicService = {
  id: string;
  name: string;
  color: string;
  hoverColor: string;
  icon: React.ReactNode;
};

export default function LinkedAccounts() {
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [serviceToUnlink, setServiceToUnlink] = useState<string | null>(null);
  const { user, linkAccountWithProvider, unlinkProvider, error } = useAuth();

  const musicServices: MusicService[] = [
    {
      id: "spotify",
      name: "Spotify",
      color: "#1DB954",
      hoverColor: "#1ed760",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      ),
    },
    {
      id: "soundcloud",
      name: "SoundCloud",
      color: "#ff5500",
      hoverColor: "#ff7700",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.56 8.87V17h8.76c1.85-.13 3.31-1.71 3.31-3.62 0-2-1.63-3.64-3.66-3.64-.5 0-1 .11-1.44.3C17.93 8.43 16.5 7.5 14.86 7.5c-.94 0-1.8.33-2.48.88-.22.17-.43.36-.61.57l-.21-.08zm-1.57 0v8.13h.31V9.04c-.11-.06-.21-.11-.31-.17zm-1.16.59v7.54h.31V9.96c-.1-.17-.21-.34-.31-.5zm-1.16.94v6.6h.31V11.3l-.31-.76zm-1.16.61v5.84h.31V12.2c-.11-.2-.21-.4-.31-.59zm-1.16.61v5.23h.31v-4.9c-.11-.11-.21-.22-.31-.33zm-1.16.29v4.95h.31V13.2l-.31-.15zm-1.16.43v4.51h.31v-4.39l-.31-.12zm-1.16.43v4.08h.31v-4.02l-.31-.06zm-1.16.24v3.85h.31v-3.81c-.11-.01-.21-.03-.31-.04z"/>
        </svg>
      ),
    },
    {
      id: "apple",
      name: "Apple Music",
      color: "#000000",
      hoverColor: "#333333",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
        </svg>
      ),
    },
    {
      id: "deezer",
      name: "Deezer",
      color: "#00c7f2",
      hoverColor: "#23d2f8",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.189V8.38h-5.19zm12.54 0v3.027H24V8.38h-5.19zM6.27 12.594v3.027h5.189v-3.027h-5.19zm6.271 0v3.027h5.19v-3.027h-5.19zm6.27 0v3.027H24v-3.027h-5.19zM0 16.81v3.029h5.19V16.81H0zm6.27 0v3.029h5.189V16.81h-5.19zm6.271 0v3.029h5.19V16.81h-5.19zm6.27 0v3.029H24V16.81h-5.19z"/>
        </svg>
      ),
    },
  ];

  const handleLinkAccount = async (providerId: string) => {
    setIsLinking(providerId);
    try {
      await linkAccountWithProvider(providerId);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setIsLinking(null);
    }
  };

  const handleUnlinkAccount = async (providerId: string) => {
    setServiceToUnlink(providerId);
    setShowConfirmDialog(true);
  };

  const confirmUnlink = async () => {
    if (!serviceToUnlink) return;
    
    setIsUnlinking(serviceToUnlink);
    setShowConfirmDialog(false);
    
    try {
      await unlinkProvider(serviceToUnlink);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setIsUnlinking(null);
      setServiceToUnlink(null);
    }
  };

  // Check if a provider is linked by looking at the user's providerData
  const isProviderLinked = (providerId: string) => {
    if (!user) return false;
    
    // Map provider IDs to Firebase provider IDs
    const providerMap: Record<string, string> = {
      'google': 'google.com',
      'spotify': 'spotify.com',
      'soundcloud': 'soundcloud.com',
      'apple': 'apple.com',
      'deezer': 'deezer.com'
    };
    
    const firebaseProviderId = providerMap[providerId];
    return user.providerData.some(provider => provider.providerId === firebaseProviderId);
  };

  // Check if this is the only linked provider
  const isOnlyLinkedProvider = (providerId: string) => {
    if (!user) return false;
    
    // Don't allow unlinking if this is the only provider and there's no email/password
    const hasEmailProvider = user.providerData.some(provider => provider.providerId === 'password');
    
    // Count OAuth providers (excluding email/password)
    const oauthProviders = user.providerData.filter(provider => provider.providerId !== 'password');
    
    // If there's only one OAuth provider and no email/password, don't allow unlinking
    return oauthProviders.length === 1 && !hasEmailProvider && isProviderLinked(providerId);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-neutral-100">
          Linked Music Services
        </h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
          <p>
            Connect your music streaming accounts to access your playlists and favorites.
          </p>
        </div>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-5 space-y-4">
          {musicServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: service.color }}
                >
                  {service.icon}
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {service.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isProviderLinked(service.id) 
                      ? "Connected" 
                      : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {isProviderLinked(service.id) ? (
                  <button
                    type="button"
                    onClick={() => handleUnlinkAccount(service.id)}
                    disabled={isUnlinking !== null || isOnlyLinkedProvider(service.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUnlinking === service.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Disconnecting...
                      </>
                    ) : (
                      "Disconnect"
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLinkAccount(service.id)}
                    disabled={isLinking !== null}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: service.color,
                    }}
                  >
                    {isLinking === service.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Modal Dialog */}
      {showConfirmDialog && serviceToUnlink && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={() => setShowConfirmDialog(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle dark:bg-neutral-800">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-neutral-100">
                    Disconnect Account
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Are you sure you want to disconnect your {musicServices.find(s => s.id === serviceToUnlink)?.name} account? 
                      You will lose access to your playlists and favorites from this service.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmUnlink}
                >
                  Disconnect
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-base font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm dark:bg-neutral-700 dark:text-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-600"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 