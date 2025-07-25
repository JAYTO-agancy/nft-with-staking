import Image from "next/image";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { StakableNFTAbi } from "@/shared/lib/abis/StakabeNFT.abi";

const CONTRACT_ADDRESS = "0x43ccC21884F39E40edef71980C93aD87FDe99763";

const rarityColors: Record<string, string> = {
  Legendary: "border-yellow-400",
  Epic: "border-purple-500",
  Rare: "border-blue-400",
  Uncommon: "border-green-400",
  Common: "border-gray-300",
};

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
    <section className="w-full bg-gray-50 py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
          Last Minted
        </h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className={`flex flex-col items-center rounded-xl border-4 p-4 ${rarityColors[nft.rarity]}`}
              >
                <Image
                  src={nft.imageUrl}
                  alt={`NFT #${nft.id}`}
                  width={120}
                  height={120}
                  className="mb-2 rounded-lg"
                />
                <div className="font-semibold">#{nft.id}</div>
                <div className="text-sm text-gray-600">{nft.rarity}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
