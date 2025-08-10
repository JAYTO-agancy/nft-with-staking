"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { createPublicClient, webSocket } from "viem";
import { sepolia } from "viem/chains";
import { StakableNFTAbi } from "@/shared/lib/abis/StakabeNFT.abi";
import { Sparkles, Clock, ExternalLink } from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import { useRef } from "react";
import { CONTRACTS_ADDRESS, BASE_URL_NFT } from "@/shared/lib/constants";
import {
  checkS3ImageAvailable,
  waitForS3ImageAvailable,
  getImageUrl,
} from "@/shared/lib/nftAvailability";
import { NFTCard } from "@/shared/components/NFTCard";

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

function NFTSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 backdrop-blur-xl"
      initial={{ opacity: 0, y: 50, rotateX: 45 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.8,
        type: "spring" as const,
        damping: 20,
      }}
    >
      {/* Skeleton shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut" as const,
        }}
      />

      <div className="space-y-4">
        <motion.div
          className="aspect-square w-full rounded-2xl bg-gradient-to-br from-gray-700/50 to-gray-800/50"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="space-y-2">
          <motion.div
            className="h-4 w-16 rounded bg-gray-700/50"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="h-3 w-20 rounded bg-gray-700/50"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function LastMintedSection() {
  const [nfts, setNfts] = useState<
    Array<{ id: number; imageUrl: string; rarity: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const publicClient = usePublicClient();
  const wsClient = useRef<ReturnType<typeof createPublicClient> | null>(null);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = (ref.current as HTMLElement).getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    setIsMounted(true);

    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Init WS client if possible
    if (!wsClient.current) {
      const url = process.env.NEXT_PUBLIC_WS_RPC_URL;
      if (url) {
        try {
          wsClient.current = createPublicClient({
            chain: sepolia,
            transport: webSocket(url, { retryCount: 0 }),
          });
        } catch {}
      }
    }

    async function fetchLastMinted() {
      setLoading(true);
      try {
        const totalSupply = await publicClient?.readContract({
          address: CONTRACTS_ADDRESS.StakableNFT,
          abi: StakableNFTAbi,
          functionName: "totalSupply",
        });
        const lastIds = Array.from(
          { length: 6 },
          (_, i) => Number(totalSupply) - i,
        ).filter((id) => id > 0);

        const RARITY_NAMES = [
          "Common",
          "Uncommon",
          "Rare",
          "Epic",
          "Legendary",
        ];

        const nftData = await Promise.all(
          lastIds.map(async (id) => {
            // Build S3 URLs directly
            const jsonUrl = `${BASE_URL_NFT}/${id}.json`;
            const imageUrl = `${BASE_URL_NFT}/${id}.png`;

            let rarity = "";
            try {
              const res = await fetch(jsonUrl, { cache: "no-store" });
              if (res.ok) {
                const meta = await res.json();
                rarity =
                  meta.attributes?.find((a: any) => a.trait_type === "Rarity")
                    ?.value || "";
              }
            } catch {}

            // Fallback to chain if metadata not available or rarity empty
            if (!rarity) {
              try {
                const onchainRarity = await publicClient?.readContract({
                  address: CONTRACTS_ADDRESS.StakableNFT,
                  abi: StakableNFTAbi,
                  functionName: "getTokenRarity",
                  args: [BigInt(id)],
                });
                const idx = Number(onchainRarity);
                if (
                  !Number.isNaN(idx) &&
                  idx >= 0 &&
                  idx < RARITY_NAMES.length
                ) {
                  rarity = RARITY_NAMES[idx];
                }
              } catch {}
            }

            return { id, imageUrl, rarity };
          }),
        );
        setNfts(nftData);
      } finally {
        setLoading(false);
      }
    }
    fetchLastMinted();
  }, [publicClient]);

  // Live updates via WS: push newly minted NFTs to the list
  useEffect(() => {
    const client = wsClient.current;
    if (!client) return;

    const unwatch = client.watchContractEvent?.({
      address: CONTRACTS_ADDRESS.StakableNFT,
      abi: StakableNFTAbi as any,
      eventName: "NFTMinted",
      onLogs: (logs: any[]) => {
        setNfts((prev) => {
          const next = [...prev];
          for (const log of logs) {
            const tokenId = Number(log.args?.tokenId ?? 0);
            const imageUrl = getImageUrl(tokenId);
            const rarityIdx = Number(log.args?.rarity ?? 0);
            const RARITY_NAMES = [
              "Common",
              "Uncommon",
              "Rare",
              "Epic",
              "Legendary",
            ];
            const rarity = RARITY_NAMES[rarityIdx] ?? "";
            // Only show when image is available on S3 to avoid broken image placeholders
            if (!next.find((x) => x.id === tokenId)) {
              // Try short bounded wait (no infinite loops)
              waitForS3ImageAvailable(tokenId, {
                maxAttempts: 5,
                baseMs: 1000,
                maxMs: 4000,
              })
                .then((ok) => {
                  if (!ok) return;
                  setNfts((prev2) => {
                    const p = [...prev2];
                    if (!p.find((x) => x.id === tokenId)) {
                      p.unshift({ id: tokenId, imageUrl, rarity });
                      if (p.length > 6) p.pop();
                    }
                    return p;
                  });
                })
                .catch(() => {});
            }
          }
          return next;
        });
      },
      onError: () => {},
    });
    return () => {
      try {
        unwatch?.();
      } catch {}
    };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 100,
      },
    },
  };

  const nftVariants: Variants = {
    hidden: {
      y: 100,
      opacity: 0,
      rotateX: 45,
      scale: 0.8,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black py-12"
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-40 left-1/3 h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute right-1/3 bottom-40 h-96 w-96 rounded-full bg-gradient-to-r from-pink-500/10 to-cyan-500/10 blur-3xl" />

        {/* Floating particles (client-only to avoid SSR mismatch) */}
        {isMounted &&
          Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
      </div>

      {/* Mouse follower light */}
      <motion.div
        className="pointer-events-none absolute z-10 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl"
        style={{
          x: useTransform(smoothMouseX, (x) => x - 192),
          y: useTransform(smoothMouseY, (y) => y - 192),
        }}
      />

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-16"
        >
          {/* Header */}
          <motion.div variants={headerVariants} className="text-center">
            <motion.div
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Clock className="h-5 w-5 text-blue-400" />
              </motion.div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-sm font-medium text-transparent">
                Fresh Mints
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-purple-400" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="mb-6 text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear" as const,
              }}
              style={{
                background:
                  "linear-gradient(90deg, #ffffff, #60a5fa, #a855f7, #ec4899, #ffffff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LATEST DROPS
            </motion.h2>

            <motion.p
              className="mx-auto max-w-3xl text-lg text-gray-400 md:text-xl"
              variants={headerVariants}
            >
              Discover the newest Plumffels that have joined our exclusive
              collection. Each one is a unique masterpiece with its own rarity
              and personality.
            </motion.p>
          </motion.div>

          {/* NFTs Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:gap-8 lg:grid-cols-5">
              {Array.from({ length: isMobile ? 6 : 5 }).map((_, i) => (
                <NFTSkeleton key={i} index={i} />
              ))}
            </div>
          ) : nfts.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              variants={headerVariants}
            >
              <motion.div
                className="mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-8"
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Sparkles className="h-12 w-12 text-purple-400" />
              </motion.div>
              <h3 className="mb-2 text-2xl font-bold text-white">
                No NFTs Minted Yet
              </h3>
              <p className="text-gray-400">
                Be the first to mint a legendary Plumffel!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:gap-8 lg:grid-cols-5">
              {nfts.slice(0, isMobile ? 6 : 5).map((nft, index) => (
                <motion.div key={nft.id} variants={nftVariants}>
                  <NFTCard
                    tokenId={nft.id}
                    imageUrl={nft.imageUrl}
                    rarity={nft.rarity}
                    showNewBadge={index === 0}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Button */}
          {/* {nfts.length > 0 && (
            <motion.div variants={headerVariants} className="text-center">
              <motion.button
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-12 py-4 font-semibold text-white shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  Explore All NFTs
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </motion.div>
                </motion.span>

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          )} */}
        </motion.div>
      </div>
    </section>
  );
}
