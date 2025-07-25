import { Button } from "@/shared/ui/kit/button";
import { Sparkles, ExternalLink, Zap, Heart } from "lucide-react";
import Image from "next/image";

export function MintSection({
  onMint,
  mintedNft,
}: {
  onMint: () => void;
  mintedNft?: { imageUrl: string; rarity: string; txHash: string } | null;
}) {
  const rarityConfig: Record<
    string,
    { color: string; badge: string; emoji: string }
  > = {
    Legendary: {
      color: "border-yellow-400 shadow-yellow-400/30",
      badge: "bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900",
      emoji: "👑",
    },
    Epic: {
      color: "border-purple-500 shadow-purple-500/30",
      badge: "bg-gradient-to-r from-purple-500 to-pink-600 text-white",
      emoji: "💎",
    },
    Rare: {
      color: "border-blue-400 shadow-blue-400/30",
      badge: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white",
      emoji: "🌟",
    },
    Uncommon: {
      color: "border-green-400 shadow-green-400/30",
      badge: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
      emoji: "✨",
    },
    Common: {
      color: "border-gray-300 shadow-gray-300/30",
      badge: "bg-gradient-to-r from-gray-500 to-slate-600 text-white",
      emoji: "🔹",
    },
  };

  const config = mintedNft
    ? rarityConfig[mintedNft.rarity] || rarityConfig.Common
    : null;

  return (
    <section className="w-full bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-2 text-sm font-medium text-pink-700">
            <Zap className="h-4 w-4" />
            <span>Mint Now</span>
          </div>

          <h2 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            Get Your Plumffel
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600">
            Mint your unique Plumffel NFT and join the cutest staking community
            in Web3
          </p>
        </div>

        {!mintedNft ? (
          /* Mint Form */
          <div className="mx-auto max-w-lg">
            <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-12">
              {/* Decorative elements */}
              <div className="relative mb-8">
                <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-pink-200 opacity-60"></div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-purple-200 opacity-40"></div>
                <div className="absolute -bottom-2 left-8 h-6 w-6 rounded-full bg-blue-200 opacity-50"></div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-3xl text-white shadow-lg">
                    <Heart className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Ready to Mint?
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Each Plumffel is unique and adorable
                  </p>
                </div>
              </div>

              {/* Mint details */}
              <div className="mb-8 space-y-4">
                <div className="flex justify-between rounded-xl bg-gray-50 p-4">
                  <span className="font-medium text-gray-700">Price</span>
                  <span className="font-bold text-gray-900">0.01 ETH</span>
                </div>
                <div className="flex justify-between rounded-xl bg-gray-50 p-4">
                  <span className="font-medium text-gray-700">Network</span>
                  <span className="font-bold text-gray-900">Sepolia</span>
                </div>
                <div className="flex justify-between rounded-xl bg-gray-50 p-4">
                  <span className="font-medium text-gray-700">Supply</span>
                  <span className="font-bold text-gray-900">10,000 NFTs</span>
                </div>
              </div>

              {/* Mint button */}
              <Button
                onClick={onMint}
                size="lg"
                className="group relative w-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 py-4 text-lg font-semibold transition-all duration-300 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl hover:shadow-pink-500/25"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  Mint Your Plumffel
                  <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Button>

              {/* Benefits */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="group transition-transform duration-200 hover:scale-105">
                  <div className="mb-2 text-2xl">🎯</div>
                  <div className="text-xs font-medium text-gray-600">
                    Unique Art
                  </div>
                </div>
                <div className="group transition-transform duration-200 hover:scale-105">
                  <div className="mb-2 text-2xl">💰</div>
                  <div className="text-xs font-medium text-gray-600">
                    Staking Rewards
                  </div>
                </div>
                <div className="group transition-transform duration-200 hover:scale-105">
                  <div className="mb-2 text-2xl">🌟</div>
                  <div className="text-xs font-medium text-gray-600">
                    Community
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Minted NFT Display */
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-12">
              {/* Success header */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                  Congratulations! 🎉
                </h3>
                <p className="text-gray-600">
                  Your Plumffel has been successfully minted
                </p>
              </div>

              {/* NFT Card */}
              <div className="mx-auto mb-8 max-w-sm">
                <div
                  className={`relative overflow-hidden rounded-2xl border-4 p-4 transition-all duration-500 ${config?.color} bg-gradient-to-br from-white to-gray-50 hover:scale-105 hover:shadow-2xl`}
                >
                  {/* Rarity badge */}
                  {config && (
                    <div
                      className={`absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold shadow-lg ${config.badge} `}
                    >
                      <span>{config.emoji}</span>
                      <span>{mintedNft.rarity}</span>
                    </div>
                  )}

                  {/* NFT Image */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white/50">
                    <Image
                      src={mintedNft.imageUrl}
                      alt="Your Minted Plumffel"
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                      sizes="(max-width: 500px) 100vw, 500px"
                    />

                    {/* Celebration overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>

                  {/* NFT Info */}
                  <div className="mt-4 text-center">
                    <div className="text-lg font-bold text-gray-900">
                      Your Plumffel NFT
                    </div>
                    <div className="text-sm text-gray-600">
                      Rarity: {mintedNft.rarity}
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 hover:translate-x-full"></div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <a
                  href={`https://sepolia.etherscan.io/tx/${mintedNft.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Etherscan
                </a>

                <button className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-purple-300 px-6 py-3 font-medium text-purple-700 transition-all duration-300 hover:border-purple-400 hover:bg-purple-50">
                  <Heart className="h-4 w-4" />
                  Share Your NFT
                </button>
              </div>

              {/* Next steps */}
              <div className="mt-8 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                <h4 className="mb-3 text-center font-semibold text-gray-900">
                  What's Next?
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🏆</div>
                    <div className="text-sm font-medium text-gray-700">
                      Stake for Rewards
                    </div>
                    <div className="text-xs text-gray-600">
                      Earn passive income
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl">👥</div>
                    <div className="text-sm font-medium text-gray-700">
                      Join Community
                    </div>
                    <div className="text-xs text-gray-600">
                      Connect with others
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
