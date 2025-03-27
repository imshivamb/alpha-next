"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import LoadingScreen from "@/components/ui/loading-screen";

export default function HomePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If authenticated or token exists, redirect to dashboard, otherwise to login
    const redirectUrl = token || isAuthenticated ? "/dashboard" : "/login";
    router.replace(redirectUrl);
  }, [router, token, isAuthenticated]);

  return <LoadingScreen message="Preparing your experience..." />;
}
