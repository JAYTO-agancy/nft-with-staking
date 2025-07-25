import { Wallet, MousePointer, Eye, Trophy, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Use the button in the header to connect your Ethereum wallet (Sepolia network).",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: MousePointer,
    title: "Mint NFT",
    description:
      "Click the Mint button and confirm the transaction in your wallet.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: Eye,
    title: "View Your NFT",
    description:
      "After minting, your NFT will appear in your collection and you can see its rarity.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Trophy,
    title: "Stake & Earn",
    description:
      "Stake your Plumffel NFT to earn rewards and participate in the ecosystem.",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
];

export function HowBuySection() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-2 text-sm font-medium text-purple-700">
            <MousePointer className="h-4 w-4" />
            <span>Simple Process</span>
          </div>

          <h2 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            How to Get Your Plumffel
          </h2>

          <p className="mx-auto mb-16 max-w-2xl text-lg text-gray-600">
            Follow these simple steps to join the Plumffel family and start your
            NFT journey
          </p>
        </div>

        <div className="relative">
          {/* Connection lines for desktop */}
          <div className="absolute inset-0 hidden lg:block">
            <div className="absolute top-1/2 left-1/4 h-0.5 w-1/4 bg-gradient-to-r from-blue-200 to-purple-200"></div>
            <div className="absolute top-1/2 left-2/4 h-0.5 w-1/4 bg-gradient-to-r from-purple-200 to-green-200"></div>
            <div className="absolute top-1/2 left-3/4 h-0.5 w-1/4 bg-gradient-to-r from-green-200 to-yellow-200"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50">
                    {/* Background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                    ></div>

                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-sm font-bold text-white">
                      {i + 1}
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div
                        className={`mb-4 rounded-xl ${step.bgColor} p-4 transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className={`h-8 w-8 ${step.iconColor}`} />
                      </div>

                      {/* Title */}
                      <h3 className="mb-3 text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-800">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                        {step.description}
                      </p>

                      {/* Arrow for mobile */}
                      {i < steps.length - 1 && (
                        <div className="mt-6 block lg:hidden">
                          <div className="flex justify-center">
                            <ArrowRight className="h-5 w-5 text-gray-300" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl">
            <span>Ready to start?</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
