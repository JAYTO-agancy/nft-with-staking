import { SOCIAL_LINKS } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/css";
import { XIcon, SendIcon } from "lucide-react";

export const Footer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <footer
      className={cn(
        "w-full border-t border-white/10 backdrop-blur-xl",
        className,
      )}
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:gap-0 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <span className="text-lg font-semibold tracking-wide text-white">
            Plumffel NFT
          </span>
          <span className="ml-2 text-xs text-gray-400">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
        <div className="flex gap-4">
          <a
            href={SOCIAL_LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
          >
            <XIcon className="h-6 w-6" />
          </a>
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
          >
            <SendIcon className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};
