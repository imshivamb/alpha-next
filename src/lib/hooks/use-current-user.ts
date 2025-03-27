"use client";

import { useEffect } from 'react'
import { useAuthStore } from '../stores/use-auth-store'

export default function useCurrentUser() {
  const { user, isAuthenticated, isLoading, error, checkAuth } = useAuthStore()
  
  // Check auth only once on mount
  useEffect(() => {
    // Only run checkAuth if not already authenticated and not currently loading
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, isLoading]);

  return { 
    user,
    userId: user?.id || null,
    isLoggedIn: !!user,
    isAuthenticated,
    isLoading,
    error
  }
} 