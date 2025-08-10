import { useState, useEffect } from "react";
import { createPublicClient, http, getContract } from "viem";
import { sepolia } from "viem/chains";
import {
  StakableNFTAbi,
  NFTStakingAbi,
  RewardTokenAbi,
} from "@/shared/lib/abis";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";

// Типы для статистики
export interface RarityStats {
  name: string;
  count: number;
  limit: number;
  percentage: number;
  color: string;
  bgGradient: string;
  glowColor: string;
  icon: string;
  emoji: string;
}

export interface ContractStats {
  total: number;
  minted: number;
  remaining: number;
  mintedPercentage: number;
  rarities: RarityStats[];
  totalStaked: number;
  totalRewards: number;
}

// Клиент для работы с блокчейном
const client = createPublicClient({
  chain: sepolia,
  transport: http("https://sepolia.drpc.org"),
});

// Контракты
const nftContract = getContract({
  address: CONTRACTS_ADDRESS.StakableNFT,
  abi: StakableNFTAbi,
  client,
});

const stakingContract = getContract({
  address: CONTRACTS_ADDRESS.NFTStaking,
  abi: NFTStakingAbi,
  client,
});

const rewardTokenContract = getContract({
  address: CONTRACTS_ADDRESS.RewardToken,
  abi: RewardTokenAbi,
  client,
});

export function useContractStats() {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем базовые данные
      const [totalSupply, maxSupply, totalStaked, totalRewards] =
        await Promise.all([
          nftContract.read.totalSupply(),
          nftContract.read.MAX_SUPPLY(),
          stakingContract.read.totalStakedNFTs().catch(() => 0n), // fallback если стейкинг недоступен
          rewardTokenContract.read.totalSupply().catch(() => 0n), // fallback если токены недоступны
        ]);

      const minted = Number(totalSupply);
      const total = Number(maxSupply);
      const remaining = total - minted;
      const mintedPercentage = (minted / total) * 100;

      // Конфигурация редкостей
      const rarityConfigs = [
        {
          tier: 4, // LEGENDARY
          name: "Legendary",
          color: "from-yellow-400 via-orange-500 to-yellow-600",
          bgGradient: "from-yellow-900/30 via-orange-900/20 to-yellow-800/30",
          glowColor: "shadow-yellow-500/30",
          icon: "Crown",
          emoji: "👑",
        },
        {
          tier: 3, // EPIC
          name: "Epic",
          color: "from-purple-500 via-pink-500 to-purple-600",
          bgGradient: "from-purple-900/30 via-pink-900/20 to-purple-800/30",
          glowColor: "shadow-purple-500/30",
          icon: "Gem",
          emoji: "💎",
        },
        {
          tier: 2, // RARE
          name: "Rare",
          color: "from-blue-500 via-cyan-500 to-blue-600",
          bgGradient: "from-blue-900/30 via-cyan-900/20 to-blue-800/30",
          glowColor: "shadow-blue-500/30",
          icon: "Target",
          emoji: "🌟",
        },
        {
          tier: 1, // UNCOMMON
          name: "Uncommon",
          color: "from-green-500 via-emerald-500 to-green-600",
          bgGradient: "from-green-900/30 via-emerald-900/20 to-green-800/30",
          glowColor: "shadow-green-500/30",
          icon: "Zap",
          emoji: "✨",
        },
        {
          tier: 0, // COMMON
          name: "Common",
          color: "from-gray-500 via-slate-500 to-gray-600",
          bgGradient: "from-gray-900/30 via-slate-900/20 to-gray-800/30",
          glowColor: "shadow-gray-500/30",
          icon: "Award",
          emoji: "🔹",
        },
      ];

      // Получаем статистику по редкостям
      const rarities = await Promise.all(
        rarityConfigs.map(async (config) => {
          try {
            const [mintedCount, supplyLimit] = await Promise.all([
              nftContract.read.rarityMintedCount([config.tier]),
              nftContract.read.raritySupplyLimits([config.tier]),
            ]);

            const count = Number(mintedCount);
            const limit = Number(supplyLimit);
            const percentage = limit > 0 ? (count / limit) * 100 : 0;

            return {
              ...config,
              count,
              limit,
              percentage,
            };
          } catch (err) {
            console.warn(
              `Failed to fetch rarity data for ${config.name}:`,
              err,
            );
            return {
              ...config,
              count: 0,
              limit: 0,
              percentage: 0,
            };
          }
        }),
      );

      setStats({
        total,
        minted,
        remaining,
        mintedPercentage,
        rarities,
        totalStaked: Number(totalStaked),
        totalRewards: Number(totalRewards),
      });
    } catch (err) {
      console.error("Error fetching contract stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
}
