import React from "react";
import { cn } from "../lib/css";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export const BackdropBlock: React.FC<Props> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white bg-slate-300/20 p-4 backdrop-blur-md sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
};
