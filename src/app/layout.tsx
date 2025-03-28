import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { Toaster } from "@/components/ui/sonner";
import ImpersonationBanner from "@/components/auth/banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alpha - LinkedIn Content Creation Platform",
  description: "Create engaging LinkedIn content with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen flex flex-col">
          {/* Impersonation banner - shows only when a user is being impersonated */}
          <ImpersonationBanner />
          <AuthWrapper>{children}</AuthWrapper>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
