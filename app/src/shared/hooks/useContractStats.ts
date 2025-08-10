import { useCollectionData, useRarityData } from "./useContract";

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

export function useContractStats() {
  // Получаем данные из контрактов через wagmi
  const collectionData = useCollectionData();
  const rarityData = useRarityData();

  const loading = collectionData.isLoading || rarityData.isLoading;
  const error =
    collectionData.error?.message || rarityData.error?.message || null;

  // Конфигурация редкостей
  const rarityConfigs = [
    {
      key: "legendary" as const,
      name: "Legendary",
      color: "from-yellow-400 via-orange-500 to-yellow-600",
      bgGradient: "from-yellow-900/30 via-orange-900/20 to-yellow-800/30",
      glowColor: "shadow-yellow-500/30",
      icon: "Crown",
      emoji: "👑",
    },
    {
      key: "epic" as const,
      name: "Epic",
      color: "from-purple-500 via-pink-500 to-purple-600",
      bgGradient: "from-purple-900/30 via-pink-900/20 to-purple-800/30",
      glowColor: "shadow-purple-500/30",
      icon: "Gem",
      emoji: "💎",
    },
    {
      key: "rare" as const,
      name: "Rare",
      color: "from-blue-500 via-cyan-500 to-blue-600",
      bgGradient: "from-blue-900/30 via-cyan-900/20 to-blue-800/30",
      glowColor: "shadow-blue-500/30",
      icon: "Target",
      emoji: "🌟",
    },
    {
      key: "uncommon" as const,
      name: "Uncommon",
      color: "from-green-500 via-emerald-500 to-green-600",
      bgGradient: "from-green-900/30 via-emerald-900/20 to-green-800/30",
      glowColor: "shadow-green-500/30",
      icon: "Zap",
      emoji: "✨",
    },
    {
      key: "common" as const,
      name: "Common",
      color: "from-gray-500 via-slate-500 to-gray-600",
      bgGradient: "from-gray-900/30 via-slate-900/20 to-gray-800/30",
      glowColor: "shadow-gray-500/30",
      icon: "Award",
      emoji: "🔹",
    },
  ];

  // Формируем статистику
  const stats: ContractStats | null =
    collectionData.data && rarityData.data
      ? {
          total: collectionData.data.maxSupply,
          minted: collectionData.data.totalSupply,
          remaining:
            collectionData.data.maxSupply - collectionData.data.totalSupply,
          mintedPercentage:
            (collectionData.data.totalSupply / collectionData.data.maxSupply) *
            100,
          totalStaked: collectionData.data.totalStaked,
          totalRewards: collectionData.data.totalRewards,
          rarities: rarityConfigs.map((config) => {
            const rarityInfo = rarityData.data?.[config.key];
            const count = rarityInfo?.count || 0;
            const limit = rarityInfo?.limit || 0;
            const percentage = limit > 0 ? (count / limit) * 100 : 0;

            return {
              ...config,
              count,
              limit,
              percentage,
            };
          }),
        }
      : null;

  const refreshStats = () => {
    collectionData.refetch();
    rarityData.refetch();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
}
