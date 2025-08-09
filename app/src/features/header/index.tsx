"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogoLink } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, ShoppingBag } from "lucide-react";

const navigationItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/staking",
    label: "Staking",
    icon: Star,
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
  },
];

export const Header: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "w-full border-b border-white/10 bg-black/20 backdrop-blur-xl",
        className,
      )}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <LogoLink />

        {/* Navigation Menu */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
        </div>
      </div>
    </header>
  );
};
