"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { StakableNFTAbi } from "@/shared/lib/abis/StakabeNFT.abi";
import { Sparkles, Clock, ExternalLink, Star, Zap, Eye } from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import { useRef } from "react";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";

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
  const [hoveredNft, setHoveredNft] = useState<number | null>(null);
  const publicClient = usePublicClient();

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
    async function fetchLastMinted() {
      setLoading(true);
      try {
        const totalSupply = await publicClient?.readContract({
          address: CONTRACTS_ADDRESS.StakableNFT,
          abi: StakableNFTAbi,
          functionName: "totalSupply",
        });
        const lastIds = Array.from(
          { length: 5 },
          (_, i) => Number(totalSupply) - i,
        ).filter((id) => id > 0);
        const nftData = await Promise.all(
          lastIds.map(async (id) => {
            const tokenURI = await publicClient?.readContract({
              address: CONTRACTS_ADDRESS.StakableNFT,
              abi: StakableNFTAbi,
              functionName: "tokenURI",
              args: [BigInt(id)],
            });
            let imageUrl = "";
            let rarity = "";
            console.log("tokenURI: ", tokenURI);

            try {
              const res = await fetch(
                tokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
              );
              const meta = await res.json();
              imageUrl =
                meta.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || "";
              rarity =
                meta.attributes?.find((a: any) => a.trait_type === "Rarity")
                  ?.value || "";
            } catch {}
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
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black py-32"
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-40 left-1/3 h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute right-1/3 bottom-40 h-96 w-96 rounded-full bg-gradient-to-r from-pink-500/10 to-cyan-500/10 blur-3xl" />

        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
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
              {Array.from({ length: 5 }).map((_, i) => (
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
              {nfts.map((nft, index) => {
                const config = rarityConfig[nft.rarity] || rarityConfig.Common;
                const isHovered = hoveredNft === nft.id;

                return (
                  <motion.div
                    key={nft.id}
                    variants={nftVariants}
                    className="group relative"
                    onHoverStart={() => setHoveredNft(nft.id)}
                    onHoverEnd={() => setHoveredNft(null)}
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
                      className={`relative overflow-hidden rounded-3xl border-2 p-4 backdrop-blur-xl ${config.color} bg-gradient-to-br ${config.bgColor} `}
                      whileHover={{
                        y: -20,
                        rotateX: 10,
                        rotateY: isHovered ? (index % 2 === 0 ? -10 : 10) : 0,
                        scale: 1.05,
                      }}
                      transition={{
                        type: "spring" as const,
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      {/* Rarity badge */}
                      <motion.div
                        className={`absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold text-white shadow-2xl ${config.badge} `}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Star className="h-3 w-3" />
                        <span>{nft.rarity}</span>
                      </motion.div>

                      {/* Recently minted badge */}
                      {index === 0 && (
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
                        {nft.imageUrl ? (
                          <Image
                            src={nft.imageUrl}
                            alt={`Plumffel #${nft.id}`}
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

                        {/* Overlay gradient */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                        />

                        {/* Action buttons overlay */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300"
                          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                        >
                          <motion.button
                            className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-gray-800 shadow-xl backdrop-blur-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </motion.button>

                          <motion.button
                            className="flex items-center gap-1 rounded-full bg-purple-600/90 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Details
                          </motion.button>
                        </motion.div>

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
                          Plumffel #{nft.id}
                        </motion.div>
                        <motion.div
                          className="text-xs text-gray-400"
                          whileHover={{ scale: 1.05 }}
                        >
                          {nft.rarity} Edition
                        </motion.div>
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
              })}
            </div>
          )}

          {/* View All Button */}
          {nfts.length > 0 && (
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
          )}
        </motion.div>
      </div>
    </section>
  );
}
