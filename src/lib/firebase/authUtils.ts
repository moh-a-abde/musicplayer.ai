import { 
  signInWithPopup, 
  OAuthProvider, 
  GoogleAuthProvider,
  AuthProvider,
  getAdditionalUserInfo,
  User,
  UserCredential,
  OAuthCredential
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Get the appropriate OAuth provider instance based on provider name
 * @param providerName The name of the OAuth provider (e.g., 'google', 'spotify')
 * @returns The configured OAuth provider instance
 */
export const getOAuthProvider = (providerName: string): AuthProvider => {
  switch (providerName.toLowerCase()) {
    case 'google':
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      return googleProvider;
      
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
      appleProvider.addScope('email');
      appleProvider.addScope('name');
      return appleProvider;
      
    case 'deezer':
      const deezerProvider = new OAuthProvider('deezer.com');
      return deezerProvider;
      
    default:
      throw new Error(`Provider ${providerName} is not supported`);
  }
};

/**
 * Sign in with an OAuth provider
 * @param providerName The name of the OAuth provider to sign in with
 * @returns The user credential result
 */
export const signInWithOAuth = async (providerName: string) => {
  const provider = getOAuthProvider(providerName);
  
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Get additional user info (isNewUser, profile, etc.)
    const additionalUserInfo = getAdditionalUserInfo(result);
    
    // Return both the user and additional info
    return {
      user: result.user,
      additionalUserInfo,
      credential: OAuthProvider.credentialFromResult(result)
    };
  } catch (error) {
    console.error(`Error signing in with ${providerName}:`, error);
    throw error;
  }
};

/**
 * Revoke OAuth tokens for a specific provider
 * This is a placeholder function as Firebase doesn't directly support token revocation
 * In a real implementation, you would need to call the provider's API to revoke tokens
 * @param user The current user
 * @param providerName The provider to revoke tokens for
 */
export const revokeOAuthTokens = async (user: User, providerName: string): Promise<void> => {
  // This is a placeholder implementation
  // In a real app, you would need to:
  // 1. Get the access token for the provider
  // 2. Call the provider's API to revoke the token
  
  console.log(`Attempting to revoke tokens for ${providerName}`);
  
  try {
    // Example implementation (not functional)
    // const token = await user.getIdToken();
    // const response = await fetch(`https://api.${providerName}.com/revoke`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ token })
    // });
    
    // For now, just log that we would revoke the token
    console.log(`Would revoke ${providerName} tokens here if implemented`);
  } catch (error) {
    console.error(`Error revoking ${providerName} tokens:`, error);
    throw error;
  }
}; 