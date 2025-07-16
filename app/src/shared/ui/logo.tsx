import Image from "next/image";
import Link from "next/link";
import React from "react";
import { cn } from "../lib/css";

interface Props {
  className?: string;
}

export const LogoLink: React.FC<Props> = ({ className }) => {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-x-2", className)}
    >
      <span className="inline-block size-8">
        <Image src="/img/logo.png" width={32} height={32} alt="logo" />
      </span>
      <span className="text-3xl leading-0 font-bold">NiftyFrogToken</span>
    </Link>
  );
};
