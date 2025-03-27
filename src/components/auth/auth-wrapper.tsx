"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useCurrentUser from "@/lib/hooks/use-current-user";
import LoadingScreen from "@/components/ui/loading-screen";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/register"];

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isLoading, isAuthenticated } = useCurrentUser();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Handle routing based on authentication state
  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;

    // If user is logged in and trying to access public route, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.push("/dashboard");
      return;
    }

    // If user is not logged in and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isPublicRoute, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading && !isPublicRoute) {
    return <LoadingScreen message="Authenticating..." />;
  }

  // Only render children if:
  // 1. User is logged in and accessing a protected route
  // 2. User is not logged in and accessing a public route
  if ((isLoggedIn && !isPublicRoute) || (!isLoggedIn && isPublicRoute)) {
    return <>{children}</>;
  }

  // Return null to avoid flash of content
  return null;
};

export default AuthWrapper;
