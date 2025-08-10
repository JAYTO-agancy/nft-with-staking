import { useState, useEffect } from "react";
import { useNFTInfo } from "./useContract";
import { BASE_URL_NFT } from "@/shared/lib/constants";
import { NFTData, NFTMetadata, RarityTier, RARITY_NAMES } from "@/shared/types";

export function useNFTData(tokenId: number) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Используем wagmi хук для получения данных из контракта
  const {
    data: contractData,
    exists,
    isLoading: contractLoading,
    error: contractError,
    refetch,
  } = useNFTInfo(tokenId);

  // Загружаем метаданные отдельно
  const fetchMetadata = async () => {
    if (!exists) return;

    try {
      setMetadataLoading(true);
      setMetadataError(null);

      const metadataUrl = `${BASE_URL_NFT}/${tokenId}.json`;
      const response = await fetch(metadataUrl);
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
      } else {
        setMetadata(null);
      }
    } catch (err) {
      console.warn(`Failed to fetch metadata for token ${tokenId}:`, err);
      setMetadataError(
        err instanceof Error ? err.message : "Failed to fetch metadata",
      );
      setMetadata(null);
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    if (tokenId > 0 && exists) {
      fetchMetadata();
    }
  }, [tokenId, exists]);

  // Проверяем валидность токена
  const isValidToken = tokenId > 0 && !isNaN(tokenId);
  if (!isValidToken) {
    return {
      nftData: null,
      loading: false,
      error: "Invalid token ID",
      refreshData: () => {},
    };
  }

  // Если токен не существует
  if (!contractLoading && !exists) {
    return {
      nftData: null,
      loading: false,
      error: "NFT does not exist",
      refreshData: () => refetch(),
    };
  }

  // Формируем данные NFT
  const nftData: NFTData | null = contractData
    ? {
        tokenId,
        owner: contractData.owner,
        metadata,
        rarity: {
          tier: contractData.rarity as RarityTier,
          name: RARITY_NAMES[contractData.rarity as RarityTier],
          multiplier: contractData.multiplier,
        },
        staking: {
          isStaked:
            contractData.stakeInfo[0] !==
            "0x0000000000000000000000000000000000000000",
          stakedAt:
            contractData.stakeInfo[0] !==
            "0x0000000000000000000000000000000000000000"
              ? Number(contractData.stakeInfo[1])
              : undefined,
          rewards:
            contractData.stakeInfo[0] !==
            "0x0000000000000000000000000000000000000000"
              ? Number(contractData.stakeInfo[2])
              : undefined,
        },
      }
    : null;

  const refreshData = () => {
    refetch();
    if (exists) {
      fetchMetadata();
    }
  };

  return {
    nftData,
    loading: contractLoading || metadataLoading,
    error: contractError?.message || metadataError || null,
    refreshData,
  };
}
