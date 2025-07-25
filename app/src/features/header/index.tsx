import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogoLink } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/css";

export const Header: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <header
      className={cn(
        "w-full border-b border-white/10 bg-black/20 backdrop-blur-xl",
        className,
      )}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <LogoLink />
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
