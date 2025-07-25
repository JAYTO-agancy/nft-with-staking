import { LogoLink } from "@/shared/ui/logo";
import React from "react";
import { Twitter, Send } from "lucide-react";

interface Props {
  className?: string;
}

export const Footer: React.FC<Props> = ({ className }) => {
  return (
    <footer className={className}>
      <div className="container flex flex-col items-center justify-between gap-4 border-t border-black pt-8 pb-4 md:flex-row">
        <LogoLink />
        <div className="mt-4 flex gap-4 md:mt-0">
          <a
            href="https://x.com/yourproject"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-blue-500"
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="https://t.me/yourproject"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="hover:text-blue-500"
          >
            <Send className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};
