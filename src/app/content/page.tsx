"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ContentIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the calendar page
    router.push("/content/calendar");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Redirecting to Content Calendar...</p>
      </div>
    </div>
  );
}
