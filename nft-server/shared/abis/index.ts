// Export all ABIs
export { StakableNFTAbi } from "./StakabeNFT.abi";
export { RewardTokenAbi } from "./RewardToken.abi";
export { NFTStakingAbi } from "./NFTStaking.abi";

// Common types for contract interactions
export interface NFTMintEvent {
  tokenId: number;
  to: string;
  from: string;
  transactionHash: string;
  blockNumber: number;
  timestamp?: number;
}

export interface RarityStats {
  rarity: number;
  name: string;
  minted: number;
  maxSupply: number;
  multiplier: number;
  remaining: number;
}

export interface ContractStats {
  totalSupply: number;
  totalMinted: number;
  lastMintBlock?: number;
  lastMintTimestamp?: number;
  maxSupply?: number;
  mintPrice?: number;
  rarityStats?: RarityStats[];
}

// Contract addresses (можно вынести в env)
export const CONTRACT_ADDRESSES = {
  NFT: "0x0000000000000000000000000000000000000000",
  REWARD_TOKEN:
    "0x0000000000000000000000000000000000000000",
  STAKING:
    "0x0000000000000000000000000000000000000000",
} as const;

// Helper function to get contract events
export const getContractEvents = (
  abi: any[],
  eventName: string
) => {
  return abi.find(
    (item) =>
      item.type === "event" &&
      item.name === eventName
  );
};

// Helper function to get contract functions
export const getContractFunction = (
  abi: any[],
  functionName: string
) => {
  return abi.find(
    (item) =>
      item.type === "function" &&
      item.name === functionName
  );
};
