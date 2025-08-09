"use client";
import {
  Wallet,
  MousePointer,
  Eye,
  Trophy,
  ArrowRight,
  Code,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Link your Web3 wallet to our secure platform using the latest blockchain protocols.",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    bgGradient: "from-blue-900/20 via-cyan-900/20 to-teal-900/20",
    glowColor: "shadow-blue-500/20",
    number: "01",
  },
  {
    icon: Code,
    title: "Smart Contract",
    description:
      "Our AI-powered smart contracts ensure fair distribution and authentic rarity generation.",
    color: "from-purple-500 via-pink-500 to-rose-500",
    bgGradient: "from-purple-900/20 via-pink-900/20 to-rose-900/20",
    glowColor: "shadow-purple-500/20",
    number: "02",
  },
  {
    icon: Zap,
    title: "Instant Mint",
    description:
      "Experience lightning-fast minting with real-time rarity calculation and immediate delivery.",
    color: "from-orange-500 via-amber-500 to-yellow-500",
    bgGradient: "from-orange-900/20 via-amber-900/20 to-yellow-900/20",
    glowColor: "shadow-orange-500/20",
    number: "03",
  },
  {
    icon: Trophy,
    title: "Stake & Earn",
    description:
      "Lock your Plumffels to earn passive rewards while contributing to the ecosystem growth.",
    color: "from-emerald-500 via-green-500 to-lime-500",
    bgGradient: "from-emerald-900/20 via-green-900/20 to-lime-900/20",
    glowColor: "shadow-emerald-500/20",
    number: "04",
  },
];

export function HowBuySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = ref.current
        ? (ref.current as HTMLElement).getBoundingClientRect()
        : { left: 0, top: 0 };
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
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
        duration: 0.8,
      },
    },
  };

  const cardVariants: Variants = {
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
        duration: 0.8,
      },
    },
  };

  const floatingElementVariants: Variants = {
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 360],
      transition: {
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
        rotate: {
          duration: 20,
          repeat: Infinity,
          ease: "linear" as const,
        },
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
        <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl" />

        {/* Floating geometric shapes (client-only) */}
        {isMounted &&
          Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              variants={floatingElementVariants}
              animate="animate"
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            >
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30" />
            </motion.div>
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
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Sparkles className="h-5 w-5 text-purple-400" />
              </motion.div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-sm font-medium text-transparent">
                Simple Process
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MousePointer className="h-5 w-5 text-pink-400" />
              </motion.div>
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
                  "linear-gradient(90deg, #ffffff, #a855f7, #ec4899, #06b6d4, #ffffff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              HOW IT WORKS
            </motion.h2>

            <motion.p
              className="mx-auto max-w-3xl text-lg text-gray-400 md:text-xl"
              variants={headerVariants}
            >
              Experience the future of NFT minting with our revolutionary
              process designed for both newcomers and seasoned collectors. Each
              step is crafted for maximum security and user experience.
            </motion.p>
          </motion.div>

          {/* Steps Grid */}
          <div className="relative">
            {/* Connection lines */}
            <div className="absolute inset-0 hidden lg:block">
              <svg className="h-full w-full" viewBox="0 0 1200 400">
                <motion.path
                  d="M 300 200 Q 600 100 900 200"
                  stroke="url(#gradient1)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="10,5"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeInOut" as const }}
                />
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isHovered = hoveredCard === index;

                return (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className="group relative"
                    onHoverStart={() => setHoveredCard(index)}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    {/* Card glow effect */}
                    <motion.div
                      className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${step.color} opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-30`}
                      animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                    />

                    {/* Main card */}
                    <motion.div
                      className={`relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl`}
                      style={{
                        perspective: "1000px",
                      }}
                      whileHover={{
                        y: -10,
                        rotateX: 5,
                        rotateY: isHovered ? (index % 2 === 0 ? -5 : 5) : 0,
                        scale: 1.02,
                      }}
                      transition={{
                        type: "spring" as const,
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      {/* Card number */}
                      <div className="absolute top-6 right-6 z-10">
                        <motion.div
                          className="text-6xl font-black text-white/10"
                          whileHover={{ scale: 1.1 }}
                        >
                          {step.number}
                        </motion.div>
                      </div>

                      {/* Content */}
                      <div className="relative z-20 p-8">
                        {/* Icon container */}
                        <motion.div
                          className={`mb-6 inline-flex rounded-2xl bg-gradient-to-r ${step.color} p-4 ${step.glowColor} shadow-2xl`}
                          whileHover={{
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </motion.div>

                        {/* Title */}
                        <motion.h3
                          className="mb-4 text-xl font-bold text-white md:text-2xl"
                          whileHover={{ x: 5 }}
                        >
                          {step.title}
                        </motion.h3>

                        {/* Description */}
                        <motion.p
                          className="text-sm leading-relaxed text-gray-400 md:text-base"
                          whileHover={{ x: 5 }}
                        >
                          {step.description}
                        </motion.p>

                        {/* Arrow indicator */}
                        <motion.div
                          className="mt-6 flex items-center gap-2 text-white/60"
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-sm">Learn more</span>
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </div>

                      {/* Floating elements inside card */}
                      <motion.div
                        className="absolute top-20 right-4 h-3 w-3 rounded-full bg-white/20"
                        animate={{
                          y: [-10, 10, -10],
                          opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5,
                        }}
                      />

                      <motion.div
                        className="absolute bottom-8 left-4 h-2 w-2 rounded-full bg-white/30"
                        animate={{
                          scale: [0.5, 1.5, 0.5],
                          opacity: [0.3, 1, 0.3],
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
                        animate={isHovered ? { x: ["100%", "-100%"] } : {}}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut" as const,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div variants={headerVariants} className="text-center">
            <motion.div
              className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-blue-900/20 p-12 backdrop-blur-xl"
              whileHover={{ scale: 1.02 }}
              transition={{
                type: "spring" as const,
                stiffness: 400,
                damping: 25,
              }}
            >
              <motion.h3
                className="mb-4 text-2xl font-bold text-white md:text-3xl"
                whileHover={{ scale: 1.05 }}
              >
                Ready to Begin?
              </motion.h3>

              <motion.p
                className="mb-8 text-gray-400"
                whileHover={{ scale: 1.02 }}
              >
                Join thousands of collectors in the most advanced NFT ecosystem
              </motion.p>

              <motion.button
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-4 font-semibold text-white shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  Start Minting
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </motion.span>

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
