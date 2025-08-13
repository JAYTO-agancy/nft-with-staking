"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid3X3, List, Loader2 } from "lucide-react";
import { NFTCard } from "./NFTCard";
import { NFTGalleryProps, RarityTier, RARITY_NAMES } from "@/shared/types";

export function NFTGallery({
  nfts,
  loading = false,
  title = "NFT Collection",
  className = "",
}: NFTGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<RarityTier | "all">(
    "all",
  );
  const [stakingFilter, setStakingFilter] = useState<
    "all" | "staked" | "unstaked"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch =
      nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.tokenId.toString().includes(searchTerm);

    const matchesRarity =
      selectedRarity === "all" || nft.rarity === selectedRarity;

    const matchesStaking =
      stakingFilter === "all" ||
      (stakingFilter === "staked" && nft.isStaked) ||
      (stakingFilter === "unstaked" && !nft.isStaked);

    return matchesSearch && matchesRarity && matchesStaking;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-3xl font-bold text-white">{title}</h2>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-4 pl-10 text-white placeholder-gray-400 backdrop-blur-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Rarity Filter */}
        <div className="relative">
          <Filter className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <select
            value={selectedRarity}
            onChange={(e) =>
              setSelectedRarity(e.target.value as RarityTier | "all")
            }
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pr-8 pl-10 text-white backdrop-blur-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Rarities</option>
            {Object.entries(RARITY_NAMES).map(([tier, name]) => (
              <option key={tier} value={tier} className="bg-gray-800">
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Staking Filter */}
        <div className="relative">
          <select
            value={stakingFilter}
            onChange={(e) =>
              setStakingFilter(e.target.value as "all" | "staked" | "unstaked")
            }
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All NFTs</option>
            <option value="staked" className="bg-gray-800">
              Staked Only
            </option>
            <option value="unstaked" className="bg-gray-800">
              Unstaked Only
            </option>
          </select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-center text-sm text-gray-400">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <span>
              {filteredNFTs.length} of {nfts.length} NFTs
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
            />
          ))}
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-2 text-lg text-gray-400">No NFTs found</div>
          <div className="text-sm text-gray-500">
            Try adjusting your filters or search terms
          </div>
        </div>
      ) : (
        <motion.div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "space-y-4"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredNFTs.map((nft, index) => (
            <motion.div
              key={nft.tokenId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NFTCard tokenId={nft.tokenId} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
