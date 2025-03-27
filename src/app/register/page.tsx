"use client";

import { useState } from "react";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import {
  PageTransition,
  FadeIn,
  ScaleIn,
  LoadingSpinner,
} from "@/components/ui/animations";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register, login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate inputs
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setErrorMessage("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    try {
      // Register the user
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Auto-login after registration
      if (user) {
        try {
          const loginResponse = await login({
            username: formData.email,
            password: formData.password,
          });

          if (loginResponse) {
            // Successful login, redirect to dashboard
            router.push("/dashboard");
          } else {
            // If auto-login fails, redirect to login page with success message
            router.push("/login?registered=true");
          }
        } catch (loginErr) {
          // If login fails after successful registration, still redirect to login
          console.error("Auto-login failed:", loginErr);
          router.push("/login?registered=true");
        }
      }
    } catch (err: Error | unknown) {
      console.error("Registration failed:", err);

      // Check for common backend errors
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (
        errorMessage.includes("SSL SYSCALL error") ||
        errorMessage.includes("EOF detected")
      ) {
        setErrorMessage("Database connection error. Please try again later.");
      } else if (
        errorMessage.includes("duplicate key") ||
        errorMessage.includes("already exists")
      ) {
        setErrorMessage(
          "This email is already registered. Please try logging in instead."
        );
      } else {
        // Use error from auth store or provide generic message
        setErrorMessage(error || "Registration failed. Please try again.");
      }
    }
  };

  // Display error from either local form state or auth store
  const displayError = errorMessage || error;

  return (
    <PageTransition>
      <div className="container flex flex-col items-center justify-center min-h-screen py-12">
        <div className="flex flex-col items-center mb-6">
          <FadeIn>
            <img src="/logo.svg" alt="Logo" className="h-10 w-auto mb-2" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-3xl font-bold">Create an Account</h1>
          </FadeIn>
        </div>

        <ScaleIn duration={0.4} className="w-full max-w-md">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Sign Up
              </CardTitle>
              <CardDescription className="text-center">
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {displayError && (
                  <FadeIn>
                    <p className="text-sm font-medium text-destructive">
                      {displayError}
                    </p>
                  </FadeIn>
                )}
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size={18} /> Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </ScaleIn>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Alpha. All rights reserved.</p>
        </div>
      </div>
    </PageTransition>
  );
}

export default RegisterPage;
