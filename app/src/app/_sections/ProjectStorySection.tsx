"use client";
import {
  Users,
  Sparkles,
  Heart,
  Target,
  Lightbulb,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/shared/ui/kit/button";
import { SOCIAL_LINKS } from "@/shared/lib/constants";

const missions = [
  {
    icon: Heart,
    title: "Spread Joy",
    description:
      "Transform the NFT landscape with adorable characters that bring genuine happiness to collectors worldwide.",
    color: "from-pink-500 via-rose-500 to-red-500",
    bgGradient: "from-pink-900/30 via-rose-900/20 to-red-900/30",
    particles: "from-pink-400 to-rose-500",
  },
  {
    icon: Target,
    title: "Real Utility",
    description:
      "Build meaningful value through advanced staking mechanisms, community governance, and ecosystem rewards.",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    bgGradient: "from-blue-900/30 via-cyan-900/20 to-teal-900/30",
    particles: "from-blue-400 to-cyan-500",
  },
  {
    icon: Users,
    title: "Build Community",
    description:
      "Foster an inclusive, creative community where every collector becomes part of the Plumffel family story.",
    color: "from-green-500 via-emerald-500 to-lime-500",
    bgGradient: "from-green-900/30 via-emerald-900/20 to-lime-900/30",
    particles: "from-green-400 to-emerald-500",
  },
  {
    icon: Lightbulb,
    title: "Innovate Always",
    description:
      "Push blockchain boundaries with cutting-edge technology while maintaining the charm that makes Plumffels special.",
    color: "from-yellow-500 via-orange-500 to-amber-500",
    bgGradient: "from-yellow-900/30 via-orange-900/20 to-amber-900/30",
    particles: "from-yellow-400 to-orange-500",
  },
];

const team = [
  {
    name: "Grigory Morgachev",
    role: "Lead Developer",
    bio: "Full-stack wizard with 8+ years in web development",
    avatar: "/img/avatar_1.png",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    name: "Tatiana Morgacheva",
    role: "Creative Director",
    bio: "Artist and designer",
    avatar: "/img/avatar_2.png",
    gradient: "from-blue-500 to-cyan-600",
  },
];

const milestones = [
  { quarter: "Q1 2024", achievement: "Collection Launch", status: "completed" },
  { quarter: "Q2 2024", achievement: "Staking Platform", status: "completed" },
  { quarter: "Q3 2024", achievement: "Mobile App", status: "in-progress" },
  { quarter: "Q4 2024", achievement: "Gaming Integration", status: "upcoming" },
];

export function ProjectStorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredMission, setHoveredMission] = useState<number | null>(null);
  const [hoveredTeamMember, setHoveredTeamMember] = useState<number | null>(
    null,
  );
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

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black py-12 sm:py-32"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/5 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="absolute right-1/5 bottom-20 h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-green-500/10 to-yellow-500/10 blur-3xl" />

        {/* Story particles (client-only) */}
        {isMounted &&
          Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.1, 0.8, 0.1],
                scale: [0.3, 1.2, 0.3],
              }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              <div className="h-1 w-1 rounded-full bg-gradient-to-r from-purple-400/40 to-pink-400/40" />
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
          className="space-y-24"
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
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear" as const,
                }}
              >
                <Sparkles className="h-5 w-5 text-purple-400" />
              </motion.div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-sm font-medium text-transparent">
                Our Story
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-5 w-5 text-pink-400" />
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
                  "linear-gradient(90deg, #ffffff, #a855f7, #ec4899, #10b981, #ffffff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PLUMFFEL UNIVERSE
            </motion.h2>

            <motion.p
              className="mx-auto max-w-4xl text-lg text-gray-400 md:text-xl"
              variants={headerVariants}
            >
              Born from a vision to blend cutting-edge blockchain technology
              with the universal language of cuteness, Plumffel represents more
              than just an NFT collection—it's a movement towards a more joyful
              digital future.
            </motion.p>
          </motion.div>

          {/* Mission Section */}
          <motion.div variants={sectionVariants} className="space-y-16">
            <div className="text-center">
              <motion.h3
                className="mb-4 text-3xl font-black text-white md:text-4xl"
                whileHover={{ scale: 1.02 }}
              >
                Our Mission
              </motion.h3>
              <motion.p
                className="mx-auto max-w-2xl text-gray-400"
                whileHover={{ scale: 1.01 }}
              >
                Four core principles that drive everything we do in the Plumffel
                ecosystem
              </motion.p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {missions.map((mission, index) => {
                const Icon = mission.icon;
                const isHovered = hoveredMission === index;

                return (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className="group relative"
                    onHoverStart={() => setHoveredMission(index)}
                    onHoverEnd={() => setHoveredMission(null)}
                    style={{ perspective: "1000px" }}
                  >
                    {/* Card glow */}
                    <motion.div
                      className={`absolute -inset-2 rounded-3xl bg-gradient-to-r ${mission.color} opacity-0 blur-xl transition-opacity duration-500`}
                      animate={
                        isHovered
                          ? { opacity: 0.3, scale: 1.05 }
                          : { opacity: 0, scale: 1 }
                      }
                    />

                    <motion.div
                      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${mission.bgGradient} p-8 backdrop-blur-xl`}
                      whileHover={{
                        y: -15,
                        rotateX: 10,
                        rotateY: isHovered ? (index % 2 === 0 ? -8 : 8) : 0,
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
                        className={`mb-6 inline-flex rounded-2xl bg-gradient-to-r ${mission.color} p-4 shadow-2xl`}
                        whileHover={{
                          scale: 1.15,
                          rotate: [0, -10, 10, 0],
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>

                      {/* Title */}
                      <motion.h4
                        className="mb-4 text-xl font-bold text-white md:text-2xl"
                        whileHover={{ x: 5 }}
                      >
                        {mission.title}
                      </motion.h4>

                      {/* Description */}
                      <motion.p
                        className="text-sm leading-relaxed text-gray-400 md:text-base"
                        whileHover={{ x: 5 }}
                      >
                        {mission.description}
                      </motion.p>

                      {/* Floating particles inside card */}
                      {isMounted &&
                        isHovered &&
                        Array.from({ length: 5 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute h-1 w-1 rounded-full bg-gradient-to-r ${mission.particles}`}
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                            }}
                            animate={{
                              scale: [0, 1.5, 0],
                              opacity: [0, 1, 0],
                              y: [0, -40],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          />
                        ))}

                      {/* Holographic shine */}
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
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div variants={sectionVariants} className="space-y-16">
            <div className="text-center">
              <motion.h3
                className="mb-4 text-3xl font-black text-white md:text-4xl"
                whileHover={{ scale: 1.02 }}
              >
                Meet the Team
              </motion.h3>
              <motion.p
                className="mx-auto max-w-2xl text-gray-400"
                whileHover={{ scale: 1.01 }}
              >
                The passionate creators behind the Plumffel universe
              </motion.p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-2">
              {team.map((member, index) => {
                const isHovered = hoveredTeamMember === index;

                return (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className="group relative"
                    onHoverStart={() => setHoveredTeamMember(index)}
                    onHoverEnd={() => setHoveredTeamMember(null)}
                    style={{ perspective: "1000px" }}
                  >
                    {/* Card container */}
                    <motion.div
                      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/50 to-black/50 p-8 text-center backdrop-blur-xl"
                      whileHover={{
                        y: -20,
                        rotateY: isHovered ? (index % 2 === 0 ? 10 : -10) : 0,
                        scale: 1.03,
                      }}
                      transition={{
                        type: "spring" as const,
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      {/* Avatar with holographic border */}
                      <motion.div
                        className="relative mx-auto mb-6 h-32 w-32"
                        whileHover={{ scale: 1.1 }}
                      >
                        <motion.div
                          className={`absolute inset-0 rounded-full bg-gradient-to-r ${member.gradient} p-1`}
                          animate={
                            isHovered
                              ? {
                                  rotate: 360,
                                  scale: [1, 1.1, 1],
                                }
                              : {}
                          }
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear" as const,
                          }}
                        >
                          <div className="h-full w-full rounded-full bg-gray-900 p-2">
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={120}
                              height={120}
                              className="h-full w-full rounded-full object-cover"
                            />
                          </div>
                        </motion.div>

                        {/* Floating status indicator */}
                        <motion.div
                          className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-xl"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="h-3 w-3 rounded-full bg-white" />
                        </motion.div>
                      </motion.div>

                      {/* Name */}
                      <motion.h4
                        className="mb-2 text-xl font-bold text-white"
                        whileHover={{ scale: 1.05 }}
                      >
                        {member.name}
                      </motion.h4>

                      {/* Role */}
                      <motion.div
                        className={`mb-4 inline-block rounded-full bg-gradient-to-r ${member.gradient} px-4 py-1 text-sm font-medium text-white`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {member.role}
                      </motion.div>

                      {/* Bio */}
                      <motion.p
                        className="mb-6 text-sm leading-relaxed text-gray-400"
                        whileHover={{ scale: 1.02 }}
                      >
                        {member.bio}
                      </motion.p>

                      {/* Holographic overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        animate={
                          isHovered
                            ? {
                                x: ["-100%", "100%"],
                                opacity: [0, 1, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 2, ease: "easeInOut" as const }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={sectionVariants} className="text-center">
            <motion.div
              className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30 p-12 backdrop-blur-xl"
              whileHover={{ scale: 1.02 }}
              transition={{
                type: "spring" as const,
                stiffness: 400,
                damping: 25,
              }}
            >
              <motion.h3
                className="mb-6 text-3xl font-black text-white md:text-4xl"
                whileHover={{ scale: 1.05 }}
              >
                Join the Plumffel Revolution
              </motion.h3>

              <motion.p
                className="mb-8 text-lg text-gray-400"
                whileHover={{ scale: 1.02 }}
              >
                Be part of a community that's redefining what NFTs can be. Cute,
                valuable, and revolutionary.
              </motion.p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="glass" asChild>
                    <a href={SOCIAL_LINKS.telegram} target="_blank">
                      <Users className="h-5 w-5" />
                      <span>Join Community</span>
                    </a>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
