import React from "react";
import { cn } from "@/shared/lib/css";
import { LogoLink } from "@/shared/ui/logo";

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn("container py-4", className)}>
      <div className="flex items-center justify-between">
        <LogoLink />
      </div>
    </header>
  );
};
