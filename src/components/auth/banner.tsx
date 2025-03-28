"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImpersonationBanner() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Only show the banner if the user is being impersonated
  if (!user?.is_impersonated) {
    return null;
  }

  const handleReturnToAdmin = async () => {
    await logout(); // Logout from the impersonated user
    router.push("/admin"); // Return to admin panel
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            You are currently impersonating {user.name}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-amber-800 border-amber-300 hover:bg-amber-100"
          onClick={handleReturnToAdmin}
        >
          Return to Admin Panel
        </Button>
      </div>
    </div>
  );
}
