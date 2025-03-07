"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TestimonialScroller from '../../components/TestimonialScroller';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { 
    signInWithEmail, 
    signInWithGoogle, 
    signInWithSpotify, 
    signInWithSoundCloud, 
    signInWithProvider,
    error, 
    clearError,
    isAuthenticating,
    user
  } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    try {
      await signInWithEmail(email, password);
      // Router will handle redirect in the useEffect
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'spotify':
          await signInWithSpotify();
          break;
        case 'soundcloud':
          await signInWithSoundCloud();
          break;
        default:
          await signInWithProvider(provider);
      }
      // Router will handle redirect in the useEffect
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white">
      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Section - Authentication Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-white dark:bg-[#0d1117]">
          <div className="w-full max-w-md space-y-8 bg-gray-50 dark:bg-[#131a24] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a3343]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign in to continue to your account
              </p>
            </div>
            
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 mt-4 border border-red-100 dark:border-red-900/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-[#2a3343] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-white dark:bg-[#1a2535] text-sm"
                    placeholder="you@example.com"
                    disabled={isAuthenticating}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="text-sm">
                      <Link href="/auth/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-[#2a3343] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-white dark:bg-[#1a2535] text-sm"
                    placeholder="••••••••"
                    disabled={isAuthenticating}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-[#2a3343] text-indigo-600 focus:ring-indigo-600 bg-white dark:bg-[#1a2535]"
                  disabled={isAuthenticating}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isAuthenticating || !email || !password}
                  className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 py-3 text-sm font-semibold text-white hover:bg-gradient-to-br hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isAuthenticating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-[#2a3343]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-50 dark:bg-[#131a24] px-2 text-gray-500 dark:text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleProviderSignIn('google')}
                  disabled={isAuthenticating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#1a2535] px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-[#2a3343] hover:bg-gray-50 dark:hover:bg-[#1e2c3d] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                      fill="#34A853"
                    />
                  </svg>
                  Google
                </button>
                
                <button
                  onClick={() => handleProviderSignIn('spotify')}
                  disabled={isAuthenticating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1DB954] px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1ed760] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify
                </button>
                
                <button
                  onClick={() => handleProviderSignIn('soundcloud')}
                  disabled={isAuthenticating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#ff5500] px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#ff7700] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.56 8.87V17h8.76c1.85-.13 3.31-1.71 3.31-3.62 0-2-1.63-3.64-3.66-3.64-.5 0-1 .11-1.44.3C17.93 8.43 16.5 7.5 14.86 7.5c-.94 0-1.8.33-2.48.88-.22.17-.43.36-.61.57l-.21-.08zm-1.57 0v8.13h.31V9.04c-.11-.06-.21-.11-.31-.17zm-1.16.59v7.54h.31V9.96c-.1-.17-.21-.34-.31-.5zm-1.16.94v6.6h.31V11.3l-.31-.76zm-1.16.61v5.84h.31V12.2c-.11-.2-.21-.4-.31-.59zm-1.16.61v5.23h.31v-4.9c-.11-.11-.21-.22-.31-.33zm-1.16.29v4.95h.31V13.2l-.31-.15zm-1.16.43v4.51h.31v-4.39l-.31-.12zm-1.16.43v4.08h.31v-4.02l-.31-.06zm-1.16.24v3.85h.31v-3.81c-.11-.01-.21-.03-.31-.04z"/>
                  </svg>
                  SoundCloud
                </button>
                
                <button
                  onClick={() => handleProviderSignIn('apple')}
                  disabled={isAuthenticating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Apple Music
                </button>
              </div>
              
              <button
                onClick={() => handleProviderSignIn('deezer')}
                disabled={isAuthenticating}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00c7f2] px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#23d2f8] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.189V8.38h-5.19zm12.54 0v3.027H24V8.38h-5.19zM6.27 12.594v3.027h5.189v-3.027h-5.19zm6.271 0v3.027h5.19v-3.027h-5.19zm6.27 0v3.027H24v-3.027h-5.19zM0 16.81v3.029h5.19V16.81H0zm6.27 0v3.029h5.189V16.81h-5.19zm6.271 0v3.029h5.19V16.81h-5.19zm6.27 0v3.029H24V16.81h-5.19z"/>
                </svg>
                Deezer
              </button>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-500">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Section - Image/Banner (hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 items-center justify-center">
          <div className="max-w-md text-center px-8">
            <h2 className="text-3xl font-bold text-white mb-4">Experience the future of music</h2>
            <p className="text-indigo-100 mb-6">
              Access your entire music collection across all platforms in one place.
              Discover new music with AI-powered recommendations tailored just for you.
            </p>
            <TestimonialScroller />
          </div>
        </div>
      </div>
    </div>
  );
} 