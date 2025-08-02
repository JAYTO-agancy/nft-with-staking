"use client";
import {
  Sparkles,
  ExternalLink,
  Zap,
  Heart,
  Star,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";
import Image from "next/image";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";

export function MintSection({
  onMint,
  mintedNft,
}: {
  onMint: () => void;
  mintedNft?: { imageUrl: string; rarity: string; txHash: string } | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

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

  const rarityConfig: Record<
    string,
    {
      color: string;
      badge: string;
      emoji: string;
      glow: string;
      particles: string;
    }
  > = {
    Legendary: {
      color: "border-yellow-400/50 shadow-yellow-400/30",
      badge: "from-yellow-400 via-orange-500 to-yellow-600",
      emoji: "👑",
      glow: "shadow-yellow-500/50",
      particles: "from-yellow-400 to-orange-500",
    },
    Epic: {
      color: "border-purple-400/50 shadow-purple-400/30",
      badge: "from-purple-500 via-pink-600 to-purple-700",
      emoji: "💎",
      glow: "shadow-purple-500/50",
      particles: "from-purple-400 to-pink-500",
    },
    Rare: {
      color: "border-blue-400/50 shadow-blue-400/30",
      badge: "from-blue-500 via-cyan-600 to-blue-700",
      emoji: "🌟",
      glow: "shadow-blue-500/50",
      particles: "from-blue-400 to-cyan-500",
    },
    Uncommon: {
      color: "border-green-400/50 shadow-green-400/30",
      badge: "from-green-500 via-emerald-600 to-green-700",
      emoji: "✨",
      glow: "shadow-green-500/50",
      particles: "from-green-400 to-emerald-500",
    },
    Common: {
      color: "border-gray-400/50 shadow-gray-400/30",
      badge: "from-gray-500 via-slate-600 to-gray-700",
      emoji: "🔹",
      glow: "shadow-gray-500/50",
      particles: "from-gray-400 to-slate-500",
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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

  const mintFormVariants: Variants = {
    hidden: {
      y: 80,
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const nftCardVariants: Variants = {
    hidden: {
      y: 100,
      opacity: 0,
      rotateY: 90,
      scale: 0.8,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        duration: 1.2,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black py-32"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-1/3 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="absolute right-1/3 bottom-32 h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl" />

        {/* Mint particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.8, 0.1],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            <div className="h-1 w-1 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30" />
          </motion.div>
        ))}
      </div>

      {/* Mouse follower effect */}
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
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Zap className="h-5 w-5 text-purple-400" />
              </motion.div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-sm font-medium text-transparent">
                Mint Your NFT
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-pink-400" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="mb-6 text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear" as const,
              }}
              style={{
                background:
                  "linear-gradient(90deg, #ffffff, #a855f7, #ec4899, #06b6d4, #ffffff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MINT PLUMFFEL
            </motion.h2>

            <motion.p
              className="mx-auto max-w-3xl text-lg text-gray-400 md:text-xl"
              variants={headerVariants}
            >
              Ready to discover your unique Plumffel? Each mint is a gateway to
              the adorable universe where rarity meets cuteness. Your perfect
              companion awaits!
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Mint Form */}
            <motion.div variants={mintFormVariants} className="space-y-8">
              {/* Mint Price Card */}
              <motion.div
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 p-8 backdrop-blur-xl"
                whileHover={{
                  scale: 1.02,
                  y: -5,
                }}
                transition={{
                  type: "spring" as const,
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {/* Price display */}
                <div className="mb-8 text-center">
                  <motion.div
                    className="mb-2 text-sm font-medium text-gray-400"
                    whileHover={{ scale: 1.05 }}
                  >
                    Mint Price
                  </motion.div>
                  <motion.div
                    className="text-4xl font-black text-white md:text-5xl"
                    whileHover={{ scale: 1.1 }}
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(168, 85, 247, 0)",
                        "0 0 20px rgba(168, 85, 247, 0.5)",
                        "0 0 0px rgba(168, 85, 247, 0)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    0.01 ETH
                  </motion.div>
                  <motion.div
                    className="text-sm text-gray-400"
                    whileHover={{ scale: 1.05 }}
                  >
                    + gas fees
                  </motion.div>
                </div>

                {/* Mint Button */}
                <motion.div
                  className="relative"
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  <motion.div
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-75 blur"
                    animate={
                      isHovered
                        ? {
                            opacity: [0.75, 1, 0.75],
                            scale: [1, 1.05, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <motion.button
                    onClick={onMint}
                    className="relative w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-6 text-xl font-bold text-white shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="flex items-center justify-center gap-3"
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="h-6 w-6" />
                      </motion.div>
                      <span>Mint Your Plumffel</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Sparkles className="h-6 w-6" />
                      </motion.div>
                    </motion.span>
                  </motion.button>
                </motion.div>

                {/* Rarity Info */}
                <div className="mt-8 space-y-4">
                  <motion.h4
                    className="text-center text-lg font-bold text-white"
                    whileHover={{ scale: 1.05 }}
                  >
                    Rarity Distribution
                  </motion.h4>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {Object.entries(rarityConfig).map(
                      ([rarity, config], index) => (
                        <motion.div
                          key={rarity}
                          className={`rounded-2xl border border-white/10 bg-gradient-to-r ${config.badge} p-4 text-center`}
                          whileHover={{
                            scale: 1.05,
                            rotateY: 5,
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <motion.div
                            className="mb-2 text-2xl"
                            animate={{
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: index * 0.5,
                            }}
                          >
                            {config.emoji}
                          </motion.div>
                          <div className="text-xs font-bold text-white">
                            {rarity}
                          </div>
                        </motion.div>
                      ),
                    )}
                  </div>
                </div>

                {/* Holographic overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                    delay: 2,
                  }}
                />
              </motion.div>

              {/* Additional Info */}
              <motion.div variants={mintFormVariants} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <motion.div
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <motion.div
                        className="rounded-full bg-green-500 p-2"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <TrendingUp className="h-5 w-5 text-white" />
                      </motion.div>
                      <span className="font-bold text-white">
                        Instant Reveal
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Your NFT metadata and rarity are revealed instantly after
                      minting
                    </p>
                  </motion.div>

                  <motion.div
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <motion.div
                        className="rounded-full bg-blue-500 p-2"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      >
                        <Award className="h-5 w-5 text-white" />
                      </motion.div>
                      <span className="font-bold text-white">Stakeable</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Earn rewards by staking your Plumffel in our platform
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Minted NFT Display */}
            <motion.div
              variants={nftCardVariants}
              className="flex items-center justify-center"
            >
              {mintedNft ? (
                <motion.div
                  className="group relative max-w-md"
                  style={{ perspective: "1000px" }}
                  initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{
                    type: "spring" as const,
                    damping: 20,
                    stiffness: 100,
                    duration: 1.5,
                  }}
                >
                  {/* Success celebration */}
                  <motion.div
                    className="absolute -inset-8 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-3xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* NFT Card */}
                  <motion.div
                    className={`relative overflow-hidden rounded-3xl border-4 p-6 backdrop-blur-xl ${rarityConfig[mintedNft.rarity]?.color || rarityConfig.Common.color} bg-gradient-to-br from-gray-900/80 to-black/80`}
                    whileHover={{
                      rotateY: 5,
                      rotateX: 5,
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
                      className={`absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-bold text-white shadow-2xl ${rarityConfig[mintedNft.rarity]?.badge || rarityConfig.Common.badge} `}
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Star className="h-4 w-4" />
                      <span>{mintedNft.rarity}</span>
                    </motion.div>

                    {/* Success badge */}
                    <motion.div
                      className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-2xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.5,
                        type: "spring" as const,
                        stiffness: 200,
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ✨
                      </motion.div>
                      <span>Minted!</span>
                    </motion.div>

                    {/* NFT Image */}
                    <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                      {mintedNft.imageUrl ? (
                        <Image
                          src={mintedNft.imageUrl}
                          alt="Minted Plumffel"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
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
                            <Sparkles className="h-16 w-16 text-purple-400" />
                          </motion.div>
                        </div>
                      )}

                      {/* Confetti particles */}
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute h-2 w-2 rounded-full bg-gradient-to-r ${
                            rarityConfig[mintedNft.rarity]?.particles ||
                            rarityConfig.Common.particles
                          }`}
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            y: [0, -50, 0],
                            x: [0, Math.random() * 40 - 20, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </div>

                    {/* NFT Info */}
                    <div className="space-y-4 text-center">
                      <motion.h3
                        className="text-2xl font-bold text-white"
                        whileHover={{ scale: 1.05 }}
                      >
                        Your Plumffel
                      </motion.h3>

                      <motion.p
                        className="text-gray-400"
                        whileHover={{ scale: 1.02 }}
                      >
                        Congratulations! You've successfully minted a{" "}
                        {mintedNft.rarity} Plumffel NFT.
                      </motion.p>

                      {/* Action buttons */}
                      <div className="flex gap-4">
                        <motion.button
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition-all hover:bg-white/20"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>View NFT</span>
                        </motion.button>

                        <motion.button
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-purple-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            window.open(
                              `https://sepolia.etherscan.io/tx/${mintedNft.txHash}`,
                              "_blank",
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Etherscan</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Holographic border animation */}
                    <motion.div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${
                        rarityConfig[mintedNft.rarity]?.particles ||
                        rarityConfig.Common.particles
                      } opacity-0`}
                      animate={{
                        opacity: [0, 0.3, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{
                        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        maskComposite: "xor",
                        padding: "4px",
                      }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="max-w-md text-center"
                  variants={nftCardVariants}
                >
                  <motion.div
                    className="relative mx-auto mb-8 h-64 w-64 rounded-3xl border-2 border-dashed border-white/20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl"
                    whileHover={{ scale: 1.05 }}
                    animate={{
                      borderColor: [
                        "rgba(255, 255, 255, 0.2)",
                        "rgba(168, 85, 247, 0.5)",
                        "rgba(236, 72, 153, 0.5)",
                        "rgba(255, 255, 255, 0.2)",
                      ],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <div className="flex h-full items-center justify-center">
                      <motion.div
                        animate={{
                          y: [-10, 10, -10],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Heart className="h-16 w-16 text-purple-400" />
                      </motion.div>
                    </div>

                    {/* Question mark particles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-purple-400/50"
                        style={{
                          left: `${20 + Math.cos((i * 45 * Math.PI) / 180) * 100}px`,
                          top: `${20 + Math.sin((i * 45 * Math.PI) / 180) * 100}px`,
                        }}
                        animate={{
                          scale: [0.5, 1.2, 0.5],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>

                  <motion.h3
                    className="mb-4 text-2xl font-bold text-white"
                    whileHover={{ scale: 1.05 }}
                  >
                    Your NFT Awaits
                  </motion.h3>

                  <motion.p
                    className="text-gray-400"
                    whileHover={{ scale: 1.02 }}
                  >
                    Mint your Plumffel to discover which adorable companion will
                    join your collection!
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
