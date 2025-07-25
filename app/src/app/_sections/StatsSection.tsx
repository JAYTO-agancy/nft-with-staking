import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Award, Users } from "lucide-react";

const stats = {
  total: 10000,
  minted: 4321,
  rarities: [
    {
      name: "Legendary",
      count: 12,
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
      icon: "👑",
    },
    {
      name: "Epic",
      count: 100,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-r from-purple-50 to-pink-50",
      icon: "💎",
    },
    {
      name: "Rare",
      count: 400,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
      icon: "🌟",
    },
    {
      name: "Uncommon",
      count: 1200,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
      icon: "✨",
    },
    {
      name: "Common",
      count: 2609,
      color: "from-gray-500 to-slate-500",
      bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
      icon: "🔹",
    },
  ],
};

function AnimatedCounter({
  target,
  duration = 2000,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * easeOutProgress));

      if (progress >= 1) {
        clearInterval(timer);
        setCount(target);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function ProgressBar({
  percentage,
  gradient,
}: {
  percentage: number;
  gradient: string;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
      <div
        className={`h-full bg-gradient-to-r ${gradient} transition-all duration-2000 ease-out`}
        style={{ width: `${width}%` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
    </div>
  );
}

export function StatsSection() {
  const remaining = stats.total - stats.minted;
  const mintedPercentage = (stats.minted / stats.total) * 100;

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 px-6 py-2 text-sm font-medium text-green-700">
            <BarChart3 className="h-4 w-4" />
            <span>Collection Stats</span>
          </div>

          <h2 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            Plumffel Analytics
          </h2>

          <p className="mx-auto mb-16 max-w-2xl text-lg text-gray-600">
            Track the progress and rarity distribution of our adorable
            collection
          </p>
        </div>

        {/* Main Stats */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-4 right-4 rounded-full bg-blue-50 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900 md:text-4xl">
                <AnimatedCounter target={stats.minted} />
              </div>
              <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                Total Minted
              </div>
              <div className="text-xs text-gray-500">
                {mintedPercentage.toFixed(1)}% of collection
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-4 right-4 rounded-full bg-green-50 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900 md:text-4xl">
                <AnimatedCounter target={remaining} />
              </div>
              <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                Remaining
              </div>
              <div className="text-xs text-gray-500">
                {(100 - mintedPercentage).toFixed(1)}% available
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-4 right-4 rounded-full bg-purple-50 p-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900 md:text-4xl">
                <AnimatedCounter target={stats.total} />
              </div>
              <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                Total Supply
              </div>
              <div className="text-xs text-gray-500">
                Maximum collection size
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>
        </div>

        {/* Rarity Distribution */}
        <div className="rounded-3xl bg-white p-8 shadow-lg md:p-12">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
              Rarity Distribution
            </h3>
            <p className="text-gray-600">
              Current distribution of minted Plumffels by rarity tier
            </p>
          </div>

          <div className="space-y-6">
            {stats.rarities.map((rarity, index) => {
              const percentage = (rarity.count / stats.total) * 100;

              return (
                <div
                  key={rarity.name}
                  className={`group rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${rarity.bgColor}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{rarity.icon}</span>
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {rarity.name}
                        </span>
                        <div className="text-sm text-gray-600">
                          <AnimatedCounter
                            target={rarity.count}
                            duration={1500}
                          />{" "}
                          NFTs
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">of collection</div>
                    </div>
                  </div>

                  <ProgressBar
                    percentage={percentage}
                    gradient={rarity.color}
                  />
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-8 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 p-6">
            <div className="text-center">
              <div className="mb-2 text-lg font-semibold text-gray-900">
                Collection Progress
              </div>
              <div className="mb-4 text-3xl font-bold text-blue-600">
                {mintedPercentage.toFixed(1)}% Complete
              </div>
              <ProgressBar
                percentage={mintedPercentage}
                gradient="from-blue-500 to-purple-600"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
