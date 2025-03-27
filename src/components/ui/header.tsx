"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Calendar, User } from "lucide-react";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import useCurrentUser from "@/lib/hooks/use-current-user";
import { Button } from "./button";
import { FadeIn } from "./animations";

function Header() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { user, isLoggedIn } = useCurrentUser();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll to add shadow to header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <FadeIn y={-10} duration={0.4}>
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md transition-all duration-200 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.svg"
                alt="Alpha Logo"
                fill
                className="rounded-full"
              />
            </div>
            <span className="font-bold text-xl">Alpha</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/dashboard" active={pathname === "/dashboard"}>
              Dashboard
            </NavLink>
            <NavLink href="/calendar" active={pathname === "/calendar"}>
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </NavLink>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 hidden sm:inline-block">
                {user?.name || "User"}
              </span>
              <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-4 h-4" />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />
    </FadeIn>
  );
}

type NavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link href={href} className="relative px-3 py-2 rounded-md">
      <span
        className={`flex items-center ${
          active ? "text-primary font-medium" : "text-muted-foreground"
        }`}
      >
        {children}
      </span>

      {active && (
        <motion.div
          layoutId="activeNavItem"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
}

export default Header;
