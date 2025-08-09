"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/css";
import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { StakableNFTAbi } from "@/shared/lib/abis/StakabeNFT.abi";
import { CONTRACTS_ADDRESS, BASE_URL_NFT } from "@/shared/lib/constants";

const rarityConfig: Record<
  string,
  {
    color: string;
    bgColor: string;
    badge: string;
    glow: string;
    hologram: string;
    particles: string;
  }
> = {
  Legendary: {
    color: "border-yellow-400/50 shadow-yellow-400/30",
    bgColor: "from-yellow-900/30 via-orange-900/20 to-yellow-800/30",
    badge: "from-yellow-400 via-orange-500 to-yellow-600",
    glow: "shadow-yellow-500/50",
    hologram: "from-yellow-400/20 via-orange-400/10 to-yellow-400/20",
    particles: "from-yellow-400 to-orange-500",
  },
  Epic: {
    color: "border-purple-400/50 shadow-purple-400/30",
    bgColor: "from-purple-900/30 via-pink-900/20 to-purple-800/30",
    badge: "from-purple-500 via-pink-600 to-purple-700",
    glow: "shadow-purple-500/50",
    hologram: "from-purple-400/20 via-pink-400/10 to-purple-400/20",
    particles: "from-purple-400 to-pink-500",
  },
  Rare: {
    color: "border-blue-400/50 shadow-blue-400/30",
    bgColor: "from-blue-900/30 via-cyan-900/20 to-blue-800/30",
    badge: "from-blue-500 via-cyan-600 to-blue-700",
    glow: "shadow-blue-500/50",
    hologram: "from-blue-400/20 via-cyan-400/10 to-blue-400/20",
    particles: "from-blue-400 to-cyan-500",
  },
  Uncommon: {
    color: "border-green-400/50 shadow-green-400/30",
    bgColor: "from-green-900/30 via-emerald-900/20 to-green-800/30",
    badge: "from-green-500 via-emerald-600 to-green-700",
    glow: "shadow-green-500/50",
    hologram: "from-green-400/20 via-emerald-400/10 to-green-400/20",
    particles: "from-green-400 to-emerald-500",
  },
  Common: {
    color: "border-gray-400/50 shadow-gray-400/30",
    bgColor: "from-gray-900/30 via-slate-900/20 to-gray-800/30",
    badge: "from-gray-500 via-slate-600 to-gray-700",
    glow: "shadow-gray-500/50",
    hologram: "from-gray-400/20 via-slate-400/10 to-gray-400/20",
    particles: "from-gray-400 to-slate-500",
  },
};

type NFTCardProps = {
  id?: number;
  tokenId?: number; // New: if provided, will fetch imageUrl and rarity automatically
  imageUrl?: string; // Optional now
  rarity?: string;
  className?: string;
  showNewBadge?: boolean;
  compact?: boolean;
};

export function NFTCard({
  id,
  tokenId,
  imageUrl: providedImageUrl,
  rarity: providedRarity = "",
  className,
  showNewBadge = false,
  compact = false,
}: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState(providedImageUrl || "");
  const [rarity, setRarity] = useState(providedRarity);
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();

  const finalTokenId = tokenId ?? id;
  const config = rarityConfig[rarity] || rarityConfig.Common;

  // Fetch NFT data if tokenId is provided but imageUrl/rarity are not
  useEffect(() => {
    if (!finalTokenId || (providedImageUrl && providedRarity)) return;

    async function fetchNFTData() {
      setLoading(true);
      try {
        // Generate imageUrl from tokenId
        const generatedImageUrl = `${BASE_URL_NFT}/${finalTokenId}.png`;
        setImageUrl(generatedImageUrl);

        let fetchedRarity = "";

        // Try to fetch rarity from metadata first
        try {
          const jsonUrl = `${BASE_URL_NFT}/${finalTokenId}.json`;
          const res = await fetch(jsonUrl, { cache: "no-store" });
          if (res.ok) {
            const meta = await res.json();
            fetchedRarity =
              meta.attributes?.find((a: any) => a.trait_type === "Rarity")
                ?.value || "";
          }
        } catch {}

        // Fallback to blockchain if metadata not available or rarity empty
        if (!fetchedRarity && publicClient && finalTokenId !== undefined) {
          try {
            const onchainRarity = await publicClient.readContract({
              address: CONTRACTS_ADDRESS.StakableNFT,
              abi: StakableNFTAbi,
              functionName: "getTokenRarity",
              args: [BigInt(finalTokenId)],
            });
            const idx = Number(onchainRarity);
            const RARITY_NAMES = [
              "Common",
              "Uncommon",
              "Rare",
              "Epic",
              "Legendary",
            ];
            if (!Number.isNaN(idx) && idx >= 0 && idx < RARITY_NAMES.length) {
              fetchedRarity = RARITY_NAMES[idx];
            }
          } catch {}
        }

        setRarity(fetchedRarity || "Common");
      } finally {
        setLoading(false);
      }
    }

    fetchNFTData();
  }, [finalTokenId, providedImageUrl, providedRarity, publicClient]);

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-3",
          className,
        )}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl">
          {loading ? (
            <div className="flex h-full items-center justify-center bg-gray-800/50">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Sparkles className="h-6 w-6 text-gray-500" />
              </motion.div>
            </div>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={finalTokenId ? `#${finalTokenId}` : "NFT"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-800/50">
              <Sparkles className="h-6 w-6 text-gray-500" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-white">
          <div>{finalTokenId !== undefined ? `#${finalTokenId}` : ""}</div>
          {rarity ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-200">
              {rarity}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("group relative", className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
    >
      {/* Holographic glow */}
      <motion.div
        className={`absolute -inset-4 rounded-3xl bg-gradient-to-r ${config.hologram} opacity-0 blur-xl transition-opacity duration-500`}
        animate={
          isHovered
            ? {
                opacity: [0, 0.6, 0],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Main NFT Card */}
      <motion.div
        className={`relative overflow-hidden rounded-3xl border-2 p-4 backdrop-blur-xl ${config.color} bg-gradient-to-br ${config.bgColor}`}
        whileHover={{
          y: -20,
          rotateX: 10,
          rotateY: isHovered ? 10 : 0,
          scale: 1.05,
        }}
        transition={{
          type: "spring" as const,
          stiffness: 400,
          damping: 25,
        }}
      >
        {/* Rarity badge */}
        {rarity && (
          <motion.div
            className={`absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold text-white shadow-2xl ${config.badge}`}
            whileHover={{ scale: 1.1 }}
          >
            <Star className="h-3 w-3" />
            <span>{rarity}</span>
          </motion.div>
        )}

        {/* Recently minted badge */}
        {showNewBadge && (
          <motion.div
            className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-white"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>NEW</span>
          </motion.div>
        )}

        {/* NFT Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Sparkles className="h-8 w-8 text-gray-500" />
              </motion.div>
            </div>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={finalTokenId ? `Plumffel #${finalTokenId}` : "NFT"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Sparkles className="h-8 w-8 text-gray-500" />
              </motion.div>
            </div>
          )}

          {/* Particle effects */}
          {isHovered &&
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute h-1 w-1 rounded-full bg-gradient-to-r ${config.particles}`}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -30],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
        </div>

        {/* NFT Info */}
        <div className="mt-4 space-y-1 text-center">
          <motion.div
            className="text-sm font-bold text-white"
            whileHover={{ scale: 1.05 }}
          >
            {finalTokenId !== undefined ? `Plumffel #${finalTokenId}` : ""}
          </motion.div>
          {rarity && (
            <motion.div
              className="text-xs text-gray-400"
              whileHover={{ scale: 1.05 }}
            >
              {rarity} Edition
            </motion.div>
          )}
        </div>

        {/* Holographic shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={
            isHovered
              ? {
                  x: ["-100%", "100%"],
                  opacity: [0, 1, 0],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            ease: "easeInOut" as const,
          }}
        />

        {/* Border glow animation */}
        <motion.div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${config.particles} opacity-0`}
          animate={
            isHovered
              ? {
                  opacity: [0, 0.3, 0],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
            padding: "2px",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
