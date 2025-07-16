import { LogoLink } from "@/shared/ui/logo";
import React from "react";

interface Props {
  className?: string;
}

export const Footer: React.FC<Props> = ({ className }) => {
  return (
    <footer className={className}>
      <div className="container border-t border-black pt-8 pb-4">
        <LogoLink />
      </div>
    </footer>
  );
};
