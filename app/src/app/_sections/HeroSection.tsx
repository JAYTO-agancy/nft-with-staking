"use client";
import { Button } from "@/shared/ui/kit/button";
import Image from "next/image";
import { Sparkles, Heart, Play, ArrowRight, Zap } from "lucide-react";
import { motion, useInView, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function HeroSection({ onMint }: { onMint?: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [activeCard, setActiveCard] = useState(0);

  // Auto rotation for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-purple-900 pb-24"
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

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex min-h-screen flex-col items-center justify-start gap-8 pt-8 lg:flex-row lg:justify-center lg:gap-24 lg:pt-0"
        >
          {/* Image Fan with 3D Effects (3:4 aspect, stacked like cards) - Mobile First */}
          <div className="flex justify-center lg:order-2 lg:flex-1 lg:justify-end">
            <motion.div
              variants={itemVariants}
              className="relative h-[280px] w-[200px] lg:h-[520px] lg:w-[360px]"
            >
              <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl" />

              {/* Back card */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-6 left-0 rotate-[-10deg] lg:top-8 lg:left-0"
                style={{
                  zIndex: activeCard === 0 ? 50 : 10,
                }}
                whileHover={{ scale: 1.02, zIndex: 50 }}
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-1.5 shadow-2xl backdrop-blur-2xl lg:p-3">
                  <div className="relative h-[240px] w-[180px] overflow-hidden rounded-2xl lg:h-[480px] lg:w-[360px]">
                    <Image
                      src="/img/hero_example.png"
                      alt="Plumffel NFT Back"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 180px, 360px"
                      priority
                    />
                  </div>
                </div>
              </motion.div>

              {/* Middle card */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-0 left-5 rotate-[-3deg] lg:top-0 lg:left-6"
                style={{
                  zIndex: activeCard === 1 ? 50 : 20,
                }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, zIndex: 50 }}
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-1.5 shadow-2xl backdrop-blur-2xl lg:p-3">
                  <div className="relative h-[240px] w-[180px] overflow-hidden rounded-2xl lg:h-[480px] lg:w-[360px]">
                    <Image
                      src="/img/hero_example_2.png"
                      alt="Plumffel NFT Middle"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 180px, 360px"
                      priority
                    />
                  </div>
                </div>
              </motion.div>

              {/* Front card */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-0 left-10 rotate-[4deg] lg:top-6 lg:left-12"
                style={{
                  zIndex: activeCard === 2 ? 50 : 30,
                }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, zIndex: 50 }}
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-1.5 shadow-2xl backdrop-blur-2xl lg:p-3">
                  <div className="relative h-[240px] w-[180px] overflow-hidden rounded-2xl lg:h-[480px] lg:w-[360px]">
                    <Image
                      src="/img/hero_example_3.png"
                      alt="Plumffel NFT Front"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 180px, 360px"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="flex flex-1 flex-col items-center gap-8 text-center lg:order-1 lg:items-start lg:text-left">
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
                unique digital companion, crafted with blockchain technology.
                Stake, earn, and be part of the most adorable revolution in
                Web3.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-6 sm:flex-row sm:gap-8"
            >
              {onMint && (
                <Button
                  onClick={onMint}
                  size="lg"
                  variant="glass"
                  className="group relative flex items-center gap-3"
                >
                  <div className="rounded-full bg-white/10 p-2">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span>Mint Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:justify-start"
            >
              {[
                { value: "10K", label: "Supply", delay: 0 },
                {
                  value: process.env.NEXT_PUBLIC_MINT_PRICE,
                  label: "Price",
                  delay: 0.1,
                },
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
