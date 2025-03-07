"use client";

import React, { createContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  OAuthProvider,
  linkWithPopup,
  User,
  AuthProvider as FirebaseAuthProvider,
  setPersistence,
  browserLocalPersistence,
  onIdTokenChanged,
  getIdToken,
  unlink,
  AuthErrorCodes,
  AuthError
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { signInWithOAuth, getOAuthProvider, revokeOAuthTokens } from "../firebase/authUtils";

// Session token management
const SESSION_TOKEN_KEY = 'musicplayer_auth_token';

// Error message mapping for better user experience
const ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': "No account found with this email. Please sign up.",
  'auth/wrong-password': "Incorrect password. Please try again or reset your password.",
  'auth/email-already-in-use': "An account already exists with this email. Please sign in instead.",
  'auth/weak-password': "Password is too weak. Please use at least 6 characters.",
  'auth/invalid-email': "Invalid email address. Please check and try again.",
  'auth/popup-closed-by-user': "Sign-in was cancelled. Please try again.",
  'auth/popup-blocked': "Sign-in popup was blocked by your browser. Please allow popups for this site.",
  'auth/account-exists-with-different-credential': "An account already exists with the same email but different sign-in credentials. Try signing in using a different method.",
  'auth/network-request-failed': "Network error. Please check your internet connection and try again.",
  'auth/too-many-requests': "Too many failed attempts. Please try again later or reset your password.",
  'auth/provider-already-linked': "This account is already linked to your profile.",
  'auth/credential-already-in-use': "These credentials are already associated with another account.",
  'auth/requires-recent-login': "This operation requires a more recent login. Please sign out and sign in again.",
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithSpotify: () => Promise<void>;
  signInWithSoundCloud: () => Promise<void>;
  signInWithProvider: (providerName: string) => Promise<void>;
  linkAccountWithProvider: (providerName: string) => Promise<void>;
  unlinkProvider: (providerName: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  getAuthToken: () => Promise<string | null>;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  signInWithSpotify: async () => {},
  signInWithSoundCloud: async () => {},
  signInWithProvider: async () => {},
  linkAccountWithProvider: async () => {},
  unlinkProvider: async () => {},
  signOut: async () => {},
  error: null,
  clearError: () => {},
  getAuthToken: async () => null,
  isAuthenticating: false,
});

// Helper function to get provider instance
const getProviderInstance = (providerName: string): FirebaseAuthProvider => {
  switch (providerName.toLowerCase()) {
    case 'google':
      return new GoogleAuthProvider();
    case 'spotify':
      const spotifyProvider = new OAuthProvider('spotify.com');
      spotifyProvider.addScope('user-read-email');
      spotifyProvider.addScope('user-read-private');
      spotifyProvider.addScope('playlist-read-private');
      return spotifyProvider;
    case 'soundcloud':
      const soundcloudProvider = new OAuthProvider('soundcloud.com');
      return soundcloudProvider;
    case 'apple':
      const appleProvider = new OAuthProvider('apple.com');
      return appleProvider;
    case 'deezer':
      const deezerProvider = new OAuthProvider('deezer.com');
      return deezerProvider;
    default:
      throw new Error(`Provider ${providerName} is not supported`);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Set up Firebase persistence for session management
  useEffect(() => {
    const setupPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error: any) {
        console.error("Error setting persistence:", error);
      }
    };
    
    setupPersistence();
  }, []);

  // Listen for auth state changes and token changes
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        try {
          // Get the ID token
          const token = await getIdToken(user, true);
          setAuthToken(token);
          
          // Store token in localStorage for persistence
          localStorage.setItem(SESSION_TOKEN_KEY, token);
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      } else {
        setAuthToken(null);
        localStorage.removeItem(SESSION_TOKEN_KEY);
      }
    });

    // Try to restore token from localStorage on initial load
    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (storedToken) {
      setAuthToken(storedToken);
    }

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  // Helper function to handle authentication errors
  const handleAuthError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    // Check if it's a Firebase AuthError
    if (error.code) {
      // Use our custom error messages if available
      setError(ERROR_MESSAGES[error.code] || error.message || defaultMessage);
    } else {
      setError(error.message || defaultMessage);
    }
  };

  const signInWithGoogle = async () => {
    clearError();
    setIsAuthenticating(true);
    try {
      await signInWithOAuth('google');
    } catch (error: any) {
      handleAuthError(error, "Failed to sign in with Google");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    clearError();
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      handleAuthError(error, "Failed to sign in with email and password");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    clearError();
    setIsAuthenticating(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch (error: any) {
      handleAuthError(error, "Failed to create account");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const resetPassword = async (email: string) => {
    clearError();
    setIsAuthenticating(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      handleAuthError(error, "Failed to send password reset email");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signInWithProvider = async (providerName: string) => {
    clearError();
    setIsAuthenticating(true);
    try {
      await signInWithOAuth(providerName);
    } catch (error: any) {
      handleAuthError(error, `Failed to sign in with ${providerName}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signInWithSpotify = async () => {
    await signInWithProvider('spotify');
  };

  const signInWithSoundCloud = async () => {
    await signInWithProvider('soundcloud');
  };

  const linkAccountWithProvider = async (providerName: string) => {
    clearError();
    setIsAuthenticating(true);
    if (!auth.currentUser) {
      setError("You must be signed in to link an account");
      setIsAuthenticating(false);
      return;
    }

    try {
      const provider = getOAuthProvider(providerName);
      await linkWithPopup(auth.currentUser, provider);
    } catch (error: any) {
      handleAuthError(error, `Failed to link account with ${providerName}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const unlinkProvider = async (providerName: string) => {
    clearError();
    setIsAuthenticating(true);
    if (!auth.currentUser) {
      setError("You must be signed in to unlink an account");
      setIsAuthenticating(false);
      return;
    }

    try {
      // Map provider names to Firebase provider IDs
      const providerMap: Record<string, string> = {
        'google': 'google.com',
        'spotify': 'spotify.com',
        'soundcloud': 'soundcloud.com',
        'apple': 'apple.com',
        'deezer': 'deezer.com'
      };
      
      const providerId = providerMap[providerName];
      
      if (!providerId) {
        throw new Error(`Provider ${providerName} is not supported`);
      }
      
      // Unlink the provider
      await unlink(auth.currentUser, providerId);
      
      // Revoke OAuth tokens
      if (auth.currentUser.uid) {
        await revokeOAuthTokens(auth.currentUser.uid, providerName);
      }
    } catch (error: any) {
      handleAuthError(error, `Failed to unlink ${providerName}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signOutUser = async () => {
    clearError();
    setIsAuthenticating(true);
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem(SESSION_TOKEN_KEY);
    } catch (error: any) {
      handleAuthError(error, "Failed to sign out");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    if (user) {
      try {
        // Get a fresh token
        const token = await getIdToken(user, true);
        setAuthToken(token);
        localStorage.setItem(SESSION_TOKEN_KEY, token);
        return token;
      } catch (error) {
        console.error("Error getting auth token:", error);
      }
    }
    
    // Return cached token if available
    return authToken;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signInWithGoogle, 
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signInWithSpotify,
        signInWithSoundCloud,
        signInWithProvider,
        linkAccountWithProvider,
        unlinkProvider,
        signOut: signOutUser,
        error,
        clearError,
        getAuthToken,
        isAuthenticating
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
