import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, User, Auth, IdTokenResult } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// For development without Firebase credentials
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Firebase services
export const auth = isDevelopment ? createMockAuth() : getAuth(app);
export const db = isDevelopment ? null : getFirestore(app);
export const storage = isDevelopment ? null : getStorage(app);

// Mock auth for development
function createMockAuth(): Auth {
  const mockUser: User = {
    uid: 'mock-user-id',
    email: 'mock@example.com',
    displayName: 'Mock User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: Date.now().toString(),
      lastSignInTime: Date.now().toString(),
    },
    phoneNumber: null,
    photoURL: null,
    providerData: [],
    providerId: 'mock',
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async (): Promise<IdTokenResult> => ({
      token: 'mock-token',
      signInProvider: 'mock',
      claims: {},
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInSecondFactor: null
    }),
    reload: async () => {},
    toJSON: () => ({}),
  };

  return {
    currentUser: mockUser,
    onAuthStateChanged: (callback: (user: User | null) => void) => {
      callback(mockUser);
      return () => {};
    },
    onIdTokenChanged: () => () => {},
    beforeAuthStateChanged: () => () => {},
    authStateReady: async () => Promise.resolve(),
    app: null as any,
    name: 'mock-auth',
    config: {
      apiKey: 'mock-key',
      apiHost: 'mock-host',
      apiScheme: 'https',
      tokenApiHost: 'mock-token-host',
      sdkClientVersion: ''
    },
    setPersistence: async () => Promise.resolve(),
    signOut: async () => Promise.resolve(),
    updateCurrentUser: async () => Promise.resolve(),
    useDeviceLanguage: () => {},
    languageCode: null,
    tenantId: null,
    settings: { appVerificationDisabledForTesting: false },
    emulatorConfig: null
  } as Auth;
}
