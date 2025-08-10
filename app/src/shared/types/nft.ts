export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  dna: string;
  edition: number;
  date: number;
  attributes: NFTAttribute[];
  compiler: string;
}

export interface NFTData {
  tokenId: number;
  owner: string;
  metadata: NFTMetadata | null;
  rarity: {
    tier: RarityTier;
    name: string;
    multiplier: number;
  };
  staking?: {
    isStaked: boolean;
    stakedAt?: number;
    rewards?: number;
  };
}

export enum RarityTier {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
}

export const RARITY_NAMES: Record<RarityTier, string> = {
  [RarityTier.COMMON]: "Common",
  [RarityTier.UNCOMMON]: "Uncommon",
  [RarityTier.RARE]: "Rare",
  [RarityTier.EPIC]: "Epic",
  [RarityTier.LEGENDARY]: "Legendary",
};

export const RARITY_COLORS: Record<
  RarityTier,
  {
    gradient: string;
    bg: string;
    glow: string;
    border: string;
  }
> = {
  [RarityTier.COMMON]: {
    gradient: "from-gray-500 via-slate-500 to-gray-600",
    bg: "from-gray-900/30 via-slate-900/20 to-gray-800/30",
    glow: "shadow-gray-500/30",
    border: "border-gray-500/30",
  },
  [RarityTier.UNCOMMON]: {
    gradient: "from-green-500 via-emerald-500 to-green-600",
    bg: "from-green-900/30 via-emerald-900/20 to-green-800/30",
    glow: "shadow-green-500/30",
    border: "border-green-500/30",
  },
  [RarityTier.RARE]: {
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    bg: "from-blue-900/30 via-cyan-900/20 to-blue-800/30",
    glow: "shadow-blue-500/30",
    border: "border-blue-500/30",
  },
  [RarityTier.EPIC]: {
    gradient: "from-purple-500 via-pink-500 to-purple-600",
    bg: "from-purple-900/30 via-pink-900/20 to-purple-800/30",
    glow: "shadow-purple-500/30",
    border: "border-purple-500/30",
  },
  [RarityTier.LEGENDARY]: {
    gradient: "from-yellow-400 via-orange-500 to-yellow-600",
    bg: "from-yellow-900/30 via-orange-900/20 to-yellow-800/30",
    glow: "shadow-yellow-500/30",
    border: "border-yellow-500/30",
  },
};

// Интерфейсы для компонентов
export interface NFTCardProps {
  id?: number;
  tokenId?: number; // New: if provided, will fetch imageUrl and rarity automatically
  imageUrl?: string; // Optional now
  rarity?: string;
  className?: string;
  showNewBadge?: boolean;
  compact?: boolean;
  disableLink?: boolean; // New: disable navigation functionality
}

export interface NFTGalleryItem {
  tokenId: number;
  name?: string;
  imageUrl?: string;
  rarity: RarityTier;
  isStaked: boolean;
}

export interface NFTGalleryProps {
  nfts: NFTGalleryItem[];
  loading?: boolean;
  title?: string;
  className?: string;
}
