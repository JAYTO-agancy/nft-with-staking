"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";

type FloatingCoinsProps = {
  active?: boolean;
  count?: number;
};

export function FloatingCoins({
  active = false,
  count = 6,
}: FloatingCoinsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, -50 - Math.random() * 30],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
        >
          <Coins
            className="h-4 w-4 text-yellow-400"
            style={{
              filter: "drop-shadow(0 0 4px rgba(255, 193, 7, 0.5))",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
