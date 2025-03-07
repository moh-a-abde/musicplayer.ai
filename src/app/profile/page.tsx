"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import LinkedAccounts from "@/app/components/LinkedAccounts";
import Image from "next/image";
import ProtectedRoute from "@/lib/components/ProtectedRoute";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-neutral-900 dark:text-neutral-100">
                    User Profile
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
                    Personal details and account settings
                  </p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700">
                <dl>
                  <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Profile Picture
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100 sm:mt-0 sm:col-span-2">
                      <div className="flex items-center">
                        {user?.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-2xl font-medium text-indigo-800 dark:text-indigo-200">
                              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                            </span>
                          </div>
                        )}
                      </div>
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100 sm:mt-0 sm:col-span-2">
                      {user?.displayName || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100 sm:mt-0 sm:col-span-2">
                      {user?.email}
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Account created
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100 sm:mt-0 sm:col-span-2">
                      {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                    </dd>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Last sign in
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100 sm:mt-0 sm:col-span-2">
                      {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : "Unknown"}
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Authentication providers
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100 sm:mt-0 sm:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {user?.providerData.map((provider) => {
                          const providerName = provider.providerId.split('.')[0];
                          return (
                            <span 
                              key={provider.providerId} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                            >
                              {providerName === 'password' ? 'Email' : providerName.charAt(0).toUpperCase() + providerName.slice(1)}
                            </span>
                          );
                        })}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <LinkedAccounts />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 