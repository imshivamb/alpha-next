"use client";

import { useRouter } from "next/navigation";
import useCurrentUser from "@/lib/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";
import { PageTransition, FadeIn, SlideIn } from "@/components/ui/animations";
import { Calendar } from "lucide-react";
import LoadingScreen from "@/components/ui/loading-screen";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <PageTransition>
      <Header />

      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-center">
        <div className="max-w-3xl mx-auto">
          <FadeIn y={20} duration={0.6}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome, {user?.name || "Content Creator"}!
            </h1>
          </FadeIn>

          <SlideIn
            direction="bottom"
            duration={0.6}
            delay={0.1}
            className="mt-6"
          >
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Alpha helps you create engaging LinkedIn content that resonates
              with your audience. Let&apos;s get started with your content
              calendar.
            </p>
          </SlideIn>

          <FadeIn duration={0.6} delay={0.3} className="mt-12">
            <Button
              size="lg"
              className="group text-lg px-6 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              onClick={() => router.push("/calendar")}
            >
              <Calendar className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Go to Content Calendar
            </Button>
          </FadeIn>
        </div>
      </main>
    </PageTransition>
  );
}
