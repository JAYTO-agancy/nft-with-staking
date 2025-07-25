import React from "react";
import { cn } from "@/shared/lib/css";
import { LogoLink } from "@/shared/ui/logo";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn("container py-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <LogoLink />
        <ConnectButton />
      </div>
    </header>
  );
};
