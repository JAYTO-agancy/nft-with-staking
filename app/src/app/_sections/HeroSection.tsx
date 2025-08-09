"use client";
import { Button } from "@/shared/ui/kit/button";
import Image from "next/image";
import { Sparkles, Heart, Play, ArrowRight, Zap } from "lucide-react";
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

export function HeroSection({ onMint }: { onMint?: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const floatingVariants: Variants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-purple-900"
    >
      {/* Soft background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full bg-gradient-to-br from-purple-500/10 to-pink-500/10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex min-h-screen flex-col items-center justify-center gap-16 lg:flex-row lg:gap-24"
        >
          {/* Text Content */}
          <div className="flex flex-1 flex-col items-center gap-8 text-center lg:items-start lg:text-left">
            <motion.div variants={itemVariants} className="group relative">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-sm font-medium text-transparent">
                  Premium NFT Collection
                </span>
                <Heart className="h-5 w-5 text-pink-400" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <h1
                className="relative"
                style={{
                  background:
                    "linear-gradient(90deg, #a855f7, #ec4899, #06b6d4, #8b5cf6, #a855f7)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                <span className="block text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  PLUMFFEL
                </span>
                <span className="mt-3 block text-lg font-light text-gray-300 sm:text-xl md:text-2xl lg:text-3xl">
                  The Future of Cute
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg md:text-xl lg:max-w-xl">
                Experience the next generation of NFTs. Each Plumffel is a
                unique digital companion, crafted with cutting-edge AI and
                blockchain technology. Stake, earn, and be part of the most
                adorable revolution in Web3.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-6 sm:flex-row sm:gap-8"
            >
              {onMint && (
                <div className="group relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-70 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
                  <Button
                    onClick={onMint}
                    size="lg"
                    className="relative flex items-center gap-3 rounded-full bg-black px-8 py-4 text-lg font-semibold text-white"
                  >
                    <Zap className="h-6 w-6" />
                    <span>Mint Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <button className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-xl hover:bg-white/10">
                <div className="rounded-full bg-white/10 p-2">
                  <Play className="h-5 w-5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-8 lg:justify-start"
            >
              {[
                { value: "10K", label: "Supply", delay: 0 },
                { value: "0.01Ξ", label: "Price", delay: 0.1 },
                { value: "5", label: "Rarities", delay: 0.2 },
              ].map((stat, index) => (
                <div key={stat.label} className="group relative text-center">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="text-2xl font-bold text-white sm:text-3xl">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image with 3D Effects */}
          <div className="flex flex-1 justify-center lg:justify-end">
            <motion.div variants={itemVariants} className="group relative">
              {/* Main NFT container */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="relative"
              >
                <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl" />

                <motion.div
                  className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <Image
                    src="/img/hero_example.png"
                    alt="Plumffel NFT"
                    width={400}
                    height={400}
                    className="h-80 w-80 rounded-2xl object-cover sm:h-96 sm:w-96 lg:h-[500px] lg:w-[500px]"
                    priority
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm">Scroll to explore</span>
          <motion.div
            className="h-8 w-0.5 bg-gradient-to-b from-white/60 to-transparent"
            animate={{ height: [32, 16, 32] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </motion.section>
  );
}
