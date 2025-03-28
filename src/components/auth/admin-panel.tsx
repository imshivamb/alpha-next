"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import { User } from "@/lib/types/auth";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/animations";
import { AlertCircle } from "lucide-react";

// Use a module-level variable to prevent multiple fetches across remounts
let hasInitiallyFetched = false;

export default function AdminPanel() {
  const router = useRouter();
  const { user: currentUser, switchUser, logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(!hasInitiallyFetched);
  const [impersonating, setImpersonating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If current user is not admin, redirect to dashboard
  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Fetch users directly using the API client
  useEffect(() => {
    // Only fetch if we haven't already
    if (hasInitiallyFetched) {
      setIsLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Use the API client instead of the store method
        const response = await apiClient.get("/auth/users/");
        setUsers(response.data);
        hasInitiallyFetched = true;
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array - this runs exactly once per module load

  const handleSwitchUser = async (userId: number) => {
    setImpersonating(userId);
    try {
      const user = await switchUser(userId);
      if (user) {
        router.push("/dashboard");
      } else {
        setError("Failed to switch user");
        setImpersonating(null);
      }
    } catch (err) {
      console.error("Error switching user:", err);
      setError("Failed to switch user");
      setImpersonating(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container max-w-5xl py-8 px-4 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Logged in as {currentUser?.name} ({currentUser?.email})
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Impersonation</CardTitle>
          <CardDescription>
            Select a user from the list below to log in as them. When
            impersonating a user, you&apos;ll see a notification banner at the
            top of the screen with a button to return to the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">No users found</div>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {user.profile_image ? (
                        <AvatarImage src={user.profile_image} alt={user.name} />
                      ) : (
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.name}
                        {user.is_admin && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                        {user.id === currentUser?.id && (
                          <Badge className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={
                      user.id === currentUser?.id ? "secondary" : "default"
                    }
                    size="sm"
                    disabled={
                      user.id === currentUser?.id || impersonating === user.id
                    }
                    onClick={() => handleSwitchUser(user.id)}
                    className="min-w-24"
                  >
                    {impersonating === user.id ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size={16} />
                        Switching...
                      </span>
                    ) : user.id === currentUser?.id ? (
                      "Current User"
                    ) : (
                      "Switch to User"
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-start p-4 border-t gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            As an admin, you can sign in as any user to troubleshoot issues or
            assist them with their account.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
