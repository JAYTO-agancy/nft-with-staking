"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Crown,
  Gem,
  Target,
  Zap,
  Award,
  Calendar,
  User,
  Hash,
  Layers,
  RefreshCw,
} from "lucide-react";
import { useNFTData } from "@/shared/hooks";
import { RARITY_COLORS, RarityTier } from "@/shared/types";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";

export default function NFTPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = parseInt(params.id as string);

  const { nftData, loading, error, refreshData } = useNFTData(tokenId);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getRarityIcon = (tier: RarityTier) => {
    switch (tier) {
      case RarityTier.LEGENDARY:
        return Crown;
      case RarityTier.EPIC:
        return Gem;
      case RarityTier.RARE:
        return Target;
      case RarityTier.UNCOMMON:
        return Zap;
      case RarityTier.COMMON:
        return Award;
      default:
        return Award;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isNaN(tokenId) || tokenId < 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h1 className="mb-2 text-2xl font-bold text-white">Invalid NFT ID</h1>
          <p className="mb-4 text-gray-400">
            Please provide a valid NFT token ID
          </p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <motion.button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl transition-colors hover:bg-white/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>
      </div>

      {loading && (
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-400" />
            <h2 className="mb-2 text-xl font-semibold text-white">
              Loading NFT #{tokenId}
            </h2>
            <p className="text-gray-400">Fetching data from blockchain...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h1 className="mb-2 text-2xl font-bold text-white">
              Error Loading NFT
            </h1>
            <p className="mb-4 text-gray-400">{error}</p>
            <button
              onClick={refreshData}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {nftData && (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* NFT Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div
                className={`relative overflow-hidden rounded-3xl border-2 ${RARITY_COLORS[nftData.rarity.tier].border} ${RARITY_COLORS[nftData.rarity.tier].glow} shadow-2xl`}
              >
                {nftData.metadata?.image ? (
                  <img
                    src={nftData.metadata.image}
                    alt={nftData.metadata.name || `Plumffel NFT #${tokenId}`}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center">
                      <Hash className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                      <p className="text-gray-400">No Image Available</p>
                    </div>
                  </div>
                )}

                {/* Rarity Badge */}
                <div
                  className={`absolute top-4 right-4 rounded-full bg-gradient-to-r px-4 py-2 ${RARITY_COLORS[nftData.rarity.tier].gradient} flex items-center gap-2 text-sm font-bold text-white shadow-lg`}
                >
                  {(() => {
                    const Icon = getRarityIcon(nftData.rarity.tier);
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {nftData.rarity.name}
                </div>

                {/* Staking Status */}
                {nftData.staking?.isStaked && (
                  <div className="absolute top-4 left-4 rounded-full bg-green-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    Staked
                  </div>
                )}
              </div>
            </motion.div>

            {/* NFT Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Title and Description */}
              <div>
                <h1 className="mb-4 text-4xl font-black text-white lg:text-5xl">
                  {nftData.metadata?.name || `Plumffel NFT #${tokenId}`}
                </h1>
                <p className="text-lg leading-relaxed text-gray-300">
                  {nftData.metadata?.description ||
                    "A unique Plumffel NFT from the legendary collection."}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Token ID</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    #{tokenId}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-400">Multiplier</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {nftData.rarity.multiplier}x
                  </span>
                </div>

                {nftData.metadata?.date && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                    <div className="mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-400">Created</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {formatDate(nftData.metadata.date)}
                    </span>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-gray-400">Owner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {formatAddress(nftData.owner)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(nftData.owner)}
                      className="rounded p-1 hover:bg-white/10"
                    >
                      {copiedAddress ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Staking Info */}
              {nftData.staking && (
                <div className="rounded-xl border border-white/10 bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 backdrop-blur-xl">
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Staking Status
                  </h3>
                  {nftData.staking.isStaked ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="font-medium text-green-400">
                          Active
                        </span>
                      </div>
                      {nftData.staking.stakedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Staked Since:</span>
                          <span className="text-white">
                            {formatDate(nftData.staking.stakedAt * 1000)}
                          </span>
                        </div>
                      )}
                      {nftData.staking.rewards !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rewards:</span>
                          <span className="font-medium text-yellow-400">
                            {nftData.staking.rewards} PFC
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-gray-400">
                        This NFT is not currently staked
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Attributes */}
              {nftData.metadata?.attributes &&
                nftData.metadata.attributes.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-bold text-white">
                      Attributes
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {nftData.metadata.attributes.map((attr, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                        >
                          <div className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                            {attr.trait_type}
                          </div>
                          <div className="text-sm font-medium text-white">
                            {attr.value}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

              {/* External Links */}
              <div className="flex gap-4">
                <a
                  href={`https://sepolia.etherscan.io/token/${CONTRACTS_ADDRESS.StakableNFT}?a=${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl transition-colors hover:bg-white/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Etherscan
                </a>

                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl transition-colors hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
