import { Button } from "@/shared/ui/kit/button";
import Image from "next/image";
import { Sparkles, Heart } from "lucide-react";

export function HeroSection({ onMint }: { onMint?: () => void }) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 md:py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 h-20 w-20 animate-bounce rounded-full bg-pink-200"></div>
        <div className="absolute top-32 right-16 h-16 w-16 animate-pulse rounded-full bg-purple-200"></div>
        <div className="absolute bottom-20 left-20 h-12 w-12 animate-bounce rounded-full bg-blue-200 delay-300"></div>
        <div className="absolute right-12 bottom-32 h-24 w-24 animate-pulse rounded-full bg-pink-100 delay-500"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
          {/* Text Content */}
          <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
              <Heart className="h-4 w-4" />
              <span>Cutest NFT Collection</span>
              <Sparkles className="h-4 w-4" />
            </div>

            <h1 className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              <span className="block text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                Plumffel NFT
              </span>
              <span className="mt-2 block text-lg font-medium text-gray-600 sm:text-xl md:text-2xl">
                Fluffy Friends on the Blockchain
              </span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl lg:max-w-xl">
              Plumffel are fluffy, adorable plush toys — an NFT collection where
              each character is unique, charming, and created to bring joy to
              its owner. Collect your own set of Plumffels and participate in
              staking!
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              {onMint && (
                <Button
                  size="lg"
                  onClick={onMint}
                  className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/25"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Mint Your Plumffel
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-200 px-8 py-4 text-lg font-semibold text-purple-700 transition-all duration-300 hover:border-purple-300 hover:bg-purple-50"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  10K
                </div>
                <div className="text-sm text-gray-600">Total Supply</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  0.01Ξ
                </div>
                <div className="text-sm text-gray-600">Mint Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  5
                </div>
                <div className="text-sm text-gray-600">Rarities</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex flex-1 justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-3xl bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 opacity-75 blur-lg"></div>
              <div className="relative overflow-hidden rounded-3xl bg-white p-2 shadow-2xl">
                <Image
                  src="/img/logo.png"
                  alt="Plumffel Logo"
                  width={320}
                  height={320}
                  className="h-64 w-64 rounded-2xl object-cover transition-transform duration-500 hover:scale-105 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
                  priority
                />
              </div>
              {/* Floating badges */}
              <div className="absolute top-8 -right-4 animate-bounce rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900 shadow-lg">
                🏆 Legendary
              </div>
              <div className="absolute bottom-8 -left-4 animate-bounce rounded-full bg-green-400 px-3 py-1 text-xs font-bold text-green-900 shadow-lg delay-300">
                💚 Stakeable
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
