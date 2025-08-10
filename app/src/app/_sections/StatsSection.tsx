"use client";
import { useEffect, useState, useRef } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Zap,
  Target,
  Crown,
  Gem,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import { useContractStats } from "@/shared/hooks/useContractStats";

function AnimatedCounter({
  target,
  duration = 2000,
  delay = 0,
}: {
  target: number;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      let start = 0;
      const startTime = Date.now();
      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(target * easeOutProgress));

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          setCount(target);
        }
      };
      updateCounter();
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, target, duration, delay]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function HolographicProgressBar({
  percentage,
  gradient,
  delay = 0,
}: {
  percentage: number;
  gradient: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setWidth(percentage), delay);
    return () => clearTimeout(timer);
  }, [isInView, percentage, delay]);

  return (
    <div
      ref={ref}
      className="relative h-6 w-full overflow-hidden rounded-full border border-white/10 bg-gray-800/50 backdrop-blur-xl"
    >
      {/* Animated progress bar */}
      <motion.div
        className={`h-full bg-gradient-to-r ${gradient} relative overflow-hidden`}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{
          duration: 2,
          ease: "easeOut" as const,
          delay: delay / 1000,
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 1,
          }}
        />

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: delay / 1000,
          }}
        />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-50 blur-md`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1, delay: delay / 1000 + 1 }}
      />

      {/* Progress indicator */}
      <motion.div
        className="absolute inset-y-0 right-2 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay / 1000 + 2 }}
      >
        <span className="text-xs font-bold text-white">
          {percentage.toFixed(1)}%
        </span>
      </motion.div>
    </div>
  );
}

export function StatsSection() {
  const {
    stats: contractStats,
    loading,
    error,
    refreshStats,
  } = useContractStats();

  // Используем данные из контракта или fallback
  const stats = contractStats || {
    total: 10000,
    minted: 0,
    remaining: 10000,
    mintedPercentage: 0,
    rarities: [
      {
        name: "Legendary",
        count: 0,
        limit: 50,
        percentage: 0,
        color: "from-yellow-400 via-orange-500 to-yellow-600",
        bgGradient: "from-yellow-900/30 via-orange-900/20 to-yellow-800/30",
        glowColor: "shadow-yellow-500/30",
        icon: "Crown",
        emoji: "👑",
      },
      {
        name: "Epic",
        count: 0,
        limit: 450,
        percentage: 0,
        color: "from-purple-500 via-pink-500 to-purple-600",
        bgGradient: "from-purple-900/30 via-pink-900/20 to-purple-800/30",
        glowColor: "shadow-purple-500/30",
        icon: "Gem",
        emoji: "💎",
      },
      {
        name: "Rare",
        count: 0,
        limit: 1000,
        percentage: 0,
        color: "from-blue-500 via-cyan-500 to-blue-600",
        bgGradient: "from-blue-900/30 via-cyan-900/20 to-blue-800/30",
        glowColor: "shadow-blue-500/30",
        icon: "Target",
        emoji: "🌟",
      },
      {
        name: "Uncommon",
        count: 0,
        limit: 2500,
        percentage: 0,
        color: "from-green-500 via-emerald-500 to-green-600",
        bgGradient: "from-green-900/30 via-emerald-900/20 to-green-800/30",
        glowColor: "shadow-green-500/30",
        icon: "Zap",
        emoji: "✨",
      },
      {
        name: "Common",
        count: 0,
        limit: 6000,
        percentage: 0,
        color: "from-gray-500 via-slate-500 to-gray-600",
        bgGradient: "from-gray-900/30 via-slate-900/20 to-gray-800/30",
        glowColor: "shadow-gray-500/30",
        icon: "Award",
        emoji: "🔹",
      },
    ],
    totalStaked: 0,
    totalRewards: 0,
  };

  const remaining = stats.remaining;
  const mintedPercentage = stats.mintedPercentage;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isMounted, setIsMounted] = useState(false);

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
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const cardVariants: Variants = {
    hidden: {
      y: 80,
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
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-32 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />

        {/* Data visualization particles (client-only) */}
        {isMounted &&
          Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.6, 0.1],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <div className="h-1 w-1 rounded-full bg-gradient-to-r from-blue-400/50 to-purple-400/50" />
            </motion.div>
          ))}
      </div>

      {/* Mouse follower effect */}
      <motion.div
        className="pointer-events-none absolute z-10 h-96 w-96 rounded-full bg-gradient-to-r from-green-500/5 to-blue-500/5 blur-3xl"
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
          className="space-y-20"
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
                animate={loading ? { rotate: 360 } : { rotate: [0, 180, 360] }}
                transition={
                  loading
                    ? {
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear" as const,
                      }
                    : {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut" as const,
                      }
                }
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 text-green-400" />
                ) : (
                  <BarChart3 className="h-5 w-5 text-green-400" />
                )}
              </motion.div>
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-sm font-medium text-transparent">
                Collection Analytics {loading && "(Loading...)"}
              </span>
              {error ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </motion.div>
              )}
              <motion.button
                onClick={refreshStats}
                className="ml-2 rounded-full p-1 transition-colors hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 text-gray-400 ${loading ? "animate-spin" : ""}`}
                />
              </motion.button>
            </motion.div>

            <motion.h2
              className="mb-6 text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear" as const,
              }}
              style={{
                background:
                  "linear-gradient(90deg, #ffffff, #10b981, #3b82f6, #8b5cf6, #ffffff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              COLLECTION STATS
            </motion.h2>

            <motion.p
              className="mx-auto max-w-3xl text-lg text-gray-400 md:text-xl"
              variants={headerVariants}
            >
              Real-time analytics and distribution data from the Plumffel
              universe. Witness the growth and rarity distribution of our
              legendary collection.
            </motion.p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-4 max-w-xl rounded-lg border border-red-500/20 bg-red-900/20 p-4 text-red-300"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Failed to load live data: {error}
                  </span>
                </div>
                <div className="mt-2 text-xs text-red-400">
                  Showing fallback data. Click refresh to try again.
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                value: stats.minted,
                label: "Total Minted",
                subtitle: `${mintedPercentage.toFixed(1)}% of collection`,
                color: "from-blue-500 to-cyan-600",
                bgGradient: "from-blue-900/30 to-cyan-900/30",
                delay: 0,
              },
              {
                icon: TrendingUp,
                value: remaining,
                label: "Remaining",
                subtitle: `${(100 - mintedPercentage).toFixed(1)}% available`,
                color: "from-green-500 to-emerald-600",
                bgGradient: "from-green-900/30 to-emerald-900/30",
                delay: 200,
              },
              {
                icon: Award,
                value: stats.total,
                label: "Total Supply",
                subtitle: "Maximum collection size",
                color: "from-purple-500 to-pink-600",
                bgGradient: "from-purple-900/30 to-pink-900/30",
                delay: 400,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  className="group relative"
                  style={{ perspective: "1000px" }}
                >
                  {/* Card glow */}
                  <motion.div
                    className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${stat.color} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30`}
                  />

                  <motion.div
                    className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${stat.bgGradient} p-8 backdrop-blur-xl`}
                    whileHover={{
                      y: -10,
                      rotateX: 5,
                      scale: 1.02,
                    }}
                    transition={{
                      type: "spring" as const,
                      stiffness: 400,
                      damping: 25,
                    }}
                  >
                    {/* Icon */}
                    <motion.div
                      className={`mb-6 inline-flex rounded-2xl bg-gradient-to-r ${stat.color} p-4 shadow-2xl`}
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>

                    {/* Value */}
                    <motion.div
                      className="mb-2 text-4xl font-black text-white md:text-5xl"
                      whileHover={{ scale: 1.05 }}
                    >
                      <AnimatedCounter
                        target={stat.value}
                        duration={2000}
                        delay={stat.delay}
                      />
                    </motion.div>

                    {/* Label */}
                    <motion.div
                      className="mb-2 text-sm font-bold tracking-wider text-gray-300 uppercase"
                      whileHover={{ x: 5 }}
                    >
                      {stat.label}
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                      className="text-xs text-gray-400"
                      whileHover={{ x: 5 }}
                    >
                      {stat.subtitle}
                    </motion.div>

                    {/* Decorative elements */}
                    <motion.div
                      className="absolute top-4 right-4 h-3 w-3 rounded-full bg-white/20"
                      animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    />

                    <motion.div
                      className="absolute bottom-4 left-4 h-2 w-2 rounded-full bg-white/30"
                      animate={{
                        y: [-5, 5, -5],
                        opacity: [0.2, 0.6, 0.2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    />

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut" as const,
                        delay: index * 0.5,
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Rarity Distribution */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/50 to-black/50 p-8 backdrop-blur-xl md:p-12"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-12 text-center">
                <motion.h3
                  className="mb-4 text-3xl font-black text-white md:text-4xl"
                  whileHover={{ scale: 1.02 }}
                >
                  Rarity Distribution
                </motion.h3>
                <motion.p
                  className="text-gray-400"
                  whileHover={{ scale: 1.01 }}
                >
                  Live distribution of minted Plumffels across all rarity tiers
                </motion.p>
              </div>

              <div className="space-y-8">
                {stats.rarities.map((rarity, index) => {
                  const percentage =
                    rarity.percentage || (rarity.count / stats.total) * 100;
                  // Преобразуем строковое имя иконки в компонент
                  const getIcon = (iconName: string) => {
                    switch (iconName) {
                      case "Crown":
                        return Crown;
                      case "Gem":
                        return Gem;
                      case "Target":
                        return Target;
                      case "Zap":
                        return Zap;
                      case "Award":
                        return Award;
                      default:
                        return Award;
                    }
                  };
                  const Icon = getIcon(rarity.icon);

                  return (
                    <motion.div
                      key={rarity.name}
                      className={`group rounded-3xl border border-white/10 bg-gradient-to-r ${rarity.bgGradient} p-6 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${rarity.glowColor}`}
                      variants={cardVariants}
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
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <motion.div
                            className={`rounded-xl bg-gradient-to-r ${rarity.color} p-3 shadow-xl`}
                            whileHover={{
                              scale: 1.1,
                              rotate: [0, -10, 10, 0],
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </motion.div>

                          {/* Info */}
                          <div>
                            <motion.div
                              className="flex items-center gap-2"
                              whileHover={{ x: 5 }}
                            >
                              <span className="text-2xl">{rarity.emoji}</span>
                              <span className="text-xl font-bold text-white">
                                {rarity.name}
                              </span>
                            </motion.div>
                            <motion.div
                              className="text-sm text-gray-400"
                              whileHover={{ x: 5 }}
                            >
                              <AnimatedCounter
                                target={rarity.count}
                                duration={1800}
                                delay={index * 300}
                              />{" "}
                              NFTs minted
                            </motion.div>
                          </div>
                        </div>

                        {/* Percentage */}
                        <div className="text-right">
                          <motion.div
                            className="text-2xl font-black text-white"
                            whileHover={{ scale: 1.1 }}
                          >
                            <AnimatedCounter
                              target={Math.round(percentage * 10) / 10}
                              duration={2000}
                              delay={index * 300}
                            />
                            %
                          </motion.div>
                          <motion.div
                            className="text-xs text-gray-400"
                            whileHover={{ scale: 1.05 }}
                          >
                            of collection
                          </motion.div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <HolographicProgressBar
                        percentage={percentage}
                        gradient={rarity.color}
                        delay={index * 300}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Collection Progress Summary */}
              <motion.div
                variants={cardVariants}
                className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 p-8 backdrop-blur-xl"
              >
                <div className="text-center">
                  <motion.div
                    className="mb-4 text-2xl font-bold text-white"
                    whileHover={{ scale: 1.05 }}
                  >
                    Collection Progress
                  </motion.div>
                  <motion.div
                    className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-5xl font-black text-transparent"
                    whileHover={{ scale: 1.1 }}
                  >
                    <AnimatedCounter
                      target={Math.round(mintedPercentage * 10) / 10}
                      delay={1000}
                    />
                    %
                  </motion.div>
                  <HolographicProgressBar
                    percentage={mintedPercentage}
                    gradient="from-blue-500 via-purple-600 to-pink-600"
                    delay={1200}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
