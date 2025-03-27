"use client";

import React from "react";
import Image from "next/image";
import LoginForm from "@/components/auth/login-form";
import { PageTransition, FadeIn } from "@/components/ui/animations";

export default function LoginPage() {
  return (
    <PageTransition className="min-h-screen flex flex-col justify-center p-4 sm:p-6 md:p-8">
      <div className="absolute top-8 left-8">
        <FadeIn y={-10} duration={0.6}>
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Alpha Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-xl font-bold">Alpha</span>
          </div>
        </FadeIn>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <FadeIn y={20} duration={0.5} delay={0.1}>
            <h1 className="text-3xl font-bold tracking-tight text-center mb-8">
              Sign in to Alpha
            </h1>
          </FadeIn>

          <LoginForm />
        </div>
      </div>

      <FadeIn
        y={10}
        duration={0.5}
        delay={0.3}
        className="text-center mt-8 text-sm text-muted-foreground"
      >
        <p>
          Copyright © {new Date().getFullYear()} Alpha. All rights reserved.
        </p>
      </FadeIn>
    </PageTransition>
  );
}
