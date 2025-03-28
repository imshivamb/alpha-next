"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import { FadeIn, ScaleIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/animations";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username || !password) {
      setFormError("Please enter both email and password");
      return;
    }

    try {
      const user = await login({ username, password });
      if (user) {
        // Check if admin login is selected and the user has admin rights
        if (isAdmin) {
          if (user.is_admin) {
            router.push("/admin");
          } else {
            setFormError("You don't have admin access");
          }
        } else {
          // Regular login, redirect to dashboard
          router.push("/dashboard");
        }
      } else if (error) {
        // Error from auth store
        setFormError(error);
      } else {
        // Fallback error
        setFormError("Login failed. Please try again.");
      }
    } catch (err: Error | unknown) {
      console.error("Login failed:", err);

      // Check for common backend errors
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (
        errorMessage.includes("SSL SYSCALL error") ||
        errorMessage.includes("EOF detected")
      ) {
        setFormError("Database connection error. Please try again later.");
      } else if (
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("not found")
      ) {
        setFormError("Invalid email or password.");
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Display error from either local form state or auth store
  const displayError = formError || error;

  return (
    <ScaleIn duration={0.4} className="w-full max-w-md mx-auto">
      <Card className="border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal h-auto"
                  size="sm"
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin"
                checked={isAdmin}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setIsAdmin(checked === true)
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="admin"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Log in as administrator
              </Label>
            </div>

            {displayError && (
              <FadeIn>
                <p className="text-sm font-medium text-destructive">
                  {displayError}
                </p>
              </FadeIn>
            )}
          </CardContent>
          <CardFooter className="flex-col mt-4 space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size={18} /> Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </ScaleIn>
  );
}

export default LoginForm;
