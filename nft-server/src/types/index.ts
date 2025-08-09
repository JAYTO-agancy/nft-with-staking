export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  dna: string;
  edition: number;
  date: number;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  compiler: string;
}

export interface GenerationJob {
  id: string;
  tokenId: number;
  userAddress: string;
  rarityLevel: number;
  status:
    | "pending"
    | "generating"
    | "uploading"
    | "completed"
    | "failed";
  error?: string;
  imageUrl?: string;
  metadataUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ContractEvent {
  tokenId: number;
  to: string;
  from: string;
  transactionHash: string;
  blockNumber: number;
  rarity?: number;
}

export interface NFTStatistics {
  totalMinted: number;
  rarityDistribution: {
    [rarity: number]: {
      name: string;
      count: number;
      percentage: number;
    };
  };
  recentMints: ContractEvent[];
  lastUpdated: number;
}

// Pinata-specific types removed

export const RARITY_NAMES = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary",
} as const;

export type RarityLevel =
  keyof typeof RARITY_NAMES;
export type RarityName =
  (typeof RARITY_NAMES)[RarityLevel];
