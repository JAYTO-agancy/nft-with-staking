import {
  Users,
  Sparkles,
  Heart,
  Target,
  Star,
  Palette,
  Code,
  Lightbulb,
} from "lucide-react";

const missions = [
  {
    icon: Heart,
    title: "Spread Joy",
    description:
      "Bring happiness and cuteness to the NFT space through adorable Plumffel characters.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
  },
  {
    icon: Target,
    title: "Real Utility",
    description:
      "Provide genuine value through staking rewards, community benefits, and ecosystem growth.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
  },
  {
    icon: Users,
    title: "Build Community",
    description:
      "Foster an inclusive, friendly community where every member feels valued and heard.",
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
  },
];

const team = [
  {
    name: "Alice Chen",
    role: "Founder & CEO",
    avatar: "A",
    bio: "Blockchain enthusiast and plush toy collector with 5+ years in crypto.",
    color: "from-pink-400 to-purple-500",
    skills: ["Strategy", "Leadership", "Vision"],
  },
  {
    name: "Bob Rodriguez",
    role: "Lead Developer",
    avatar: "B",
    bio: "Full-stack developer specializing in smart contracts and DeFi protocols.",
    color: "from-blue-400 to-cyan-500",
    skills: ["Solidity", "React", "Node.js"],
  },
  {
    name: "Carol Kim",
    role: "Art Director",
    avatar: "C",
    bio: "Digital artist with a passion for creating cute, memorable characters.",
    color: "from-green-400 to-emerald-500",
    skills: ["Digital Art", "Character Design", "Animation"],
  },
];

const stats = [
  { label: "Team Members", value: "12+", icon: Users },
  { label: "Art Pieces", value: "500+", icon: Palette },
  { label: "Code Commits", value: "1000+", icon: Code },
  { label: "Community Ideas", value: "50+", icon: Lightbulb },
];

export function ProjectStorySection() {
  return (
    <section className="w-full bg-gradient-to-b from-gray-50 via-white to-pink-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-2 text-sm font-medium text-pink-700">
            <Sparkles className="h-4 w-4" />
            <span>Our Journey</span>
          </div>

          <h2 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            The Plumffel Story
          </h2>

          <p className="mx-auto mb-16 max-w-3xl text-lg text-gray-600">
            Born from a love for plush toys and a passion for web3, Plumffel NFT
            represents the perfect fusion of cuteness and cutting-edge
            technology. We're building more than just an NFT collection — we're
            creating a movement of joy in the digital world.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {missions.map((mission, index) => {
            const Icon = mission.icon;
            return (
              <div
                key={mission.title}
                className={`group relative overflow-hidden rounded-2xl p-8 shadow-lg transition-all duration-500 hover:shadow-2xl ${mission.bgColor}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative z-10">
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${mission.color} p-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {mission.title}
                  </h3>

                  <p className="leading-relaxed text-gray-700">
                    {mission.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/20"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10"></div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mb-20 rounded-3xl bg-white p-8 shadow-lg md:p-12">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
              Project Milestones
            </h3>
            <p className="text-gray-600">
              Numbers that showcase our commitment and progress
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group text-center transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-3 inline-flex rounded-xl bg-gradient-to-r from-pink-100 to-purple-100 p-4 transition-colors duration-300 group-hover:from-pink-200 group-hover:to-purple-200">
                    <Icon className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div className="text-center">
          <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Meet Our Team
          </h3>
          <p className="mx-auto mb-12 max-w-2xl text-gray-600">
            The passionate creators behind Plumffel, working tirelessly to bring
            joy to the NFT space
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-500 hover:shadow-2xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Avatar */}
                <div className="relative mx-auto mb-6 h-24 w-24">
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r ${member.color} text-3xl font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    {member.avatar}
                  </div>
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 transition-opacity duration-300 group-hover:opacity-20"></div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-gray-900">
                    {member.name}
                  </h4>
                  <div className="text-sm font-medium text-purple-600">
                    {member.role}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {member.bio}
                  </p>
                </div>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Social links placeholder */}
                <div className="mt-6 flex justify-center space-x-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-8 w-8 rounded-full bg-gray-100 transition-colors duration-200 hover:bg-gray-200"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-100 transition-colors duration-200 hover:bg-gray-200"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-100 transition-colors duration-200 hover:bg-gray-200"></div>
                </div>

                {/* Background decoration */}
                <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 opacity-50"></div>
                <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 opacity-30"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 p-8 text-white md:p-12">
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                Join the Plumffel Revolution
              </h3>
              <p className="mb-8 text-lg opacity-90">
                Be part of a community that values creativity, joy, and
                meaningful connections. Together, we're reshaping what NFTs can
                be.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button className="rounded-full bg-white px-8 py-3 font-semibold text-purple-600 transition-all duration-300 hover:bg-gray-100 hover:shadow-lg">
                  Join Community
                </button>
                <button className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-white hover:text-purple-600">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
