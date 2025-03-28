"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import AdminPanel from "@/components/auth/admin-panel";
import { PageTransition } from "@/components/ui/animations";
import LoadingScreen from "@/components/ui/loading-screen";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // One simple check - if not admin, go to dashboard
    if (user && !user.is_admin) {
      router.push("/dashboard");
    }
  }, [router, user]);

  // If no user yet, show loading
  if (!user) {
    return <LoadingScreen message="Loading admin panel..." />;
  }

  return (
    <PageTransition>
      <AdminPanel />
    </PageTransition>
  );
}
