import { useReadContract, useReadContracts } from "wagmi";
import {
  StakableNFTAbi,
  NFTStakingAbi,
  RewardTokenAbi,
} from "@/shared/lib/abis";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";

// Общий хук для чтения данных из NFT контракта
export function useNFTContract() {
  return {
    address: CONTRACTS_ADDRESS.StakableNFT,
    abi: StakableNFTAbi,
  };
}

// Общий хук для чтения данных из стейкинг контракта
export function useStakingContract() {
  return {
    address: CONTRACTS_ADDRESS.NFTStaking,
    abi: NFTStakingAbi,
  };
}

// Общий хук для чтения данных из токена наград
export function useRewardTokenContract() {
  return {
    address: CONTRACTS_ADDRESS.RewardToken,
    abi: RewardTokenAbi,
  };
}

// Хук для получения общей статистики коллекции
export function useCollectionData() {
  const nftContract = useNFTContract();
  const stakingContract = useStakingContract();
  const rewardContract = useRewardTokenContract();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...nftContract,
        functionName: "totalSupply",
      },
      {
        ...nftContract,
        functionName: "MAX_SUPPLY",
      },
      {
        ...stakingContract,
        functionName: "totalStakedNFTs",
      },
      {
        ...rewardContract,
        functionName: "totalSupply",
      },
    ],
  });

  return {
    data: data
      ? {
          totalSupply: data[0].result ? Number(data[0].result) : 0,
          maxSupply: data[1].result ? Number(data[1].result) : 10000,
          totalStaked: data[2].result ? Number(data[2].result) : 0,
          totalRewards: data[3].result ? Number(data[3].result) : 0,
        }
      : null,
    isLoading,
    error,
    refetch,
  };
}

// Хук для получения статистики по редкостям
export function useRarityData() {
  const nftContract = useNFTContract();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      // Common
      { ...nftContract, functionName: "rarityMintedCount", args: [0] },
      { ...nftContract, functionName: "raritySupplyLimits", args: [0] },
      // Uncommon
      { ...nftContract, functionName: "rarityMintedCount", args: [1] },
      { ...nftContract, functionName: "raritySupplyLimits", args: [1] },
      // Rare
      { ...nftContract, functionName: "rarityMintedCount", args: [2] },
      { ...nftContract, functionName: "raritySupplyLimits", args: [2] },
      // Epic
      { ...nftContract, functionName: "rarityMintedCount", args: [3] },
      { ...nftContract, functionName: "raritySupplyLimits", args: [3] },
      // Legendary
      { ...nftContract, functionName: "rarityMintedCount", args: [4] },
      { ...nftContract, functionName: "raritySupplyLimits", args: [4] },
    ],
  });

  return {
    data: data
      ? {
          common: {
            count: Number(data[0].result || 0),
            limit: Number(data[1].result || 0),
          },
          uncommon: {
            count: Number(data[2].result || 0),
            limit: Number(data[3].result || 0),
          },
          rare: {
            count: Number(data[4].result || 0),
            limit: Number(data[5].result || 0),
          },
          epic: {
            count: Number(data[6].result || 0),
            limit: Number(data[7].result || 0),
          },
          legendary: {
            count: Number(data[8].result || 0),
            limit: Number(data[9].result || 0),
          },
        }
      : null,
    isLoading,
    error,
    refetch,
  };
}

// Хук для получения информации об отдельном NFT
export function useNFTInfo(tokenId: number) {
  const nftContract = useNFTContract();
  const stakingContract = useStakingContract();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...nftContract,
        functionName: "totalSupply",
      },
      {
        ...nftContract,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      },
      {
        ...nftContract,
        functionName: "tokenRarity",
        args: [BigInt(tokenId)],
      },
      {
        ...nftContract,
        functionName: "getTokenMultiplier",
        args: [BigInt(tokenId)],
      },
      {
        ...stakingContract,
        functionName: "getStakeInfo",
        args: [BigInt(tokenId)],
      },
    ],
    query: {
      enabled: tokenId > 0,
    },
  });

  const exists = data?.[0].result ? Number(data[0].result) >= tokenId : false;

  return {
    data:
      data && exists
        ? {
            owner: data[1].result as string,
            rarity: Number(data[2].result),
            multiplier: Number(data[3].result),
            stakeInfo: data[4].result as [string, bigint, bigint, bigint],
          }
        : null,
    exists,
    isLoading,
    error,
    refetch,
  };
}
