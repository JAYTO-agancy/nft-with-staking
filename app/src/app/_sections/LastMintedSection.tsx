import Image from "next/image";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { StakableNFTAbi } from "@/shared/lib/abis/StakabeNFT.abi";
import { Sparkles, Clock, ExternalLink } from "lucide-react";

const CONTRACT_ADDRESS = "0x43ccC21884F39E40edef71980C93aD87FDe99763";

const rarityConfig: Record<
  string,
  { color: string; bgColor: string; badge: string }
> = {
  Legendary: {
    color: "border-yellow-400 shadow-yellow-400/20",
    bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
    badge: "bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900",
  },
  Epic: {
    color: "border-purple-500 shadow-purple-500/20",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    badge: "bg-gradient-to-r from-purple-500 to-pink-600 text-white",
  },
  Rare: {
    color: "border-blue-400 shadow-blue-400/20",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    badge: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white",
  },
  Uncommon: {
    color: "border-green-400 shadow-green-400/20",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
    badge: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
  },
  Common: {
    color: "border-gray-300 shadow-gray-300/20",
    bgColor: "bg-gradient-to-br from-gray-50 to-slate-50",
    badge: "bg-gradient-to-r from-gray-500 to-slate-600 text-white",
  },
};

function NFTSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg">
      <div className="aspect-square w-full animate-pulse rounded-xl bg-gray-200"></div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function LastMintedSection() {
  const [nfts, setNfts] = useState<
    Array<{ id: number; imageUrl: string; rarity: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchLastMinted() {
      setLoading(true);
      try {
        const totalSupply = await publicClient?.readContract({
          address: CONTRACT_ADDRESS,
          abi: StakableNFTAbi,
          functionName: "totalSupply",
        });
        const lastIds = Array.from(
          { length: 5 },
          (_, i) => Number(totalSupply) - i,
        ).filter((id) => id > 0);
        const nftData = await Promise.all(
          lastIds.map(async (id) => {
            const tokenURI = await publicClient?.readContract({
              address: CONTRACT_ADDRESS,
              abi: StakableNFTAbi,
              functionName: "tokenURI",
              args: [BigInt(id)],
            });
            let imageUrl = "";
            let rarity = "";
            console.log("tokenURI: ", tokenURI);

            try {
              const res = await fetch(
                tokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
              );
              const meta = await res.json();
              imageUrl =
                meta.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || "";
              rarity =
                meta.attributes?.find((a: any) => a.trait_type === "Rarity")
                  ?.value || "";
            } catch {}
            return { id, imageUrl, rarity };
          }),
        );
        setNfts(nftData);
      } finally {
        setLoading(false);
      }
    }
    fetchLastMinted();
  }, [publicClient]);

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-2 text-sm font-medium text-blue-700">
            <Clock className="h-4 w-4" />
            <span>Fresh Mints</span>
          </div>

          <h2 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            Last Minted Plumffels
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600">
            Discover the latest adorable Plumffels that joined our family
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <NFTSkeleton key={i} />
            ))}
          </div>
        ) : nfts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500">No NFTs minted yet</p>
            <p className="text-sm text-gray-400">
              Be the first to mint a Plumffel!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
            {nfts.map((nft, index) => {
              const config = rarityConfig[nft.rarity] || rarityConfig.Common;

              return (
                <div key={nft.id} className="group relative">
                  {/* Card */}
                  <div
                    className={`relative overflow-hidden rounded-2xl border-2 p-3 transition-all duration-500 ${config.color} ${config.bgColor} hover:scale-105 hover:shadow-xl`}
                  >
                    {/* Rarity badge */}
                    <div
                      className={`absolute top-2 right-2 z-10 rounded-full px-2 py-1 text-xs font-bold shadow-lg ${config.badge} `}
                    >
                      {nft.rarity}
                    </div>

                    {/* Recently minted badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                        New
                      </div>
                    )}

                    {/* NFT Image */}
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-white/50">
                      {nft.imageUrl ? (
                        <Image
                          src={nft.imageUrl}
                          alt={`Plumffel #${nft.id}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Sparkles className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                      {/* View button on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <button className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white">
                          <ExternalLink className="h-3 w-3" />
                          View
                        </button>
                      </div>
                    </div>

                    {/* NFT Info */}
                    <div className="mt-3 text-center">
                      <div className="text-sm font-bold text-gray-900">
                        #{nft.id}
                      </div>
                      <div className="text-xs text-gray-600">Plumffel NFT</div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View all link */}
        {nfts.length > 0 && (
          <div className="mt-12 text-center">
            <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl">
              <span>View All NFTs</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
