"use client";

import { useEffect, useState } from "react";
import { NFTGallery } from "@/shared/components";
import { RarityTier, NFTGalleryItem } from "@/shared/types";
import { BASE_URL_NFT } from "@/shared/lib/constants";

// Пример данных NFT (в реальном приложении это будет получаться из контракта)
const mockNFTs: NFTGalleryItem[] = Array.from({ length: 50 }, (_, i) => ({
  tokenId: i + 1,
  imageUrl: `${BASE_URL_NFT}/${i + 1}.png`,
  name: `Plumffel NFT #${i + 1}`,
  rarity: [
    RarityTier.COMMON,
    RarityTier.UNCOMMON,
    RarityTier.RARE,
    RarityTier.EPIC,
    RarityTier.LEGENDARY,
  ][Math.floor(Math.random() * 5)] as RarityTier,
  isStaked: Math.random() > 0.7,
}));

export default function CollectionPage() {
  const [nfts, setNfts] = useState<typeof mockNFTs>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setNfts(mockNFTs);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-5xl font-black text-white lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Plumffel Collection
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-300">
            Discover the entire collection of unique Plumffel NFTs. Each one is
            special with its own rarity and attributes.
          </p>
        </div>

        {/* NFT Gallery */}
        <NFTGallery nfts={nfts} loading={loading} title="All NFTs" />
      </div>
    </div>
  );
}
