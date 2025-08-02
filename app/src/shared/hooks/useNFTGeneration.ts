import { useState, useEffect, useCallback } from "react";

export interface NFTGenerationStatus {
  tokenId: number;
  status: "pending" | "generating" | "uploading" | "completed" | "failed";
  imageUrl?: string;
  metadataUrl?: string;
  error?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface UseNFTGenerationOptions {
  pollInterval?: number; // milliseconds
  maxRetries?: number;
  onComplete?: (status: NFTGenerationStatus) => void;
  onError?: (error: string) => void;
}

export function useNFTGeneration(
  tokenId: number | null,
  options: UseNFTGenerationOptions = {},
) {
  const {
    pollInterval = 2000, // Poll every 2 seconds
    maxRetries = 3,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState<NFTGenerationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStatus = useCallback(
    async (currentTokenId: number) => {
      try {
        const response = await fetch(`/api/nft-status/${currentTokenId}`);

        if (!response.ok) {
          if (response.status === 404) {
            // NFT generation not found - might not be started yet
            return null;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get NFT status");
        }

        const newStatus: NFTGenerationStatus = {
          tokenId: data.tokenId,
          status: data.status,
          imageUrl: data.imageUrl,
          metadataUrl: data.metadataUrl,
          error: data.error,
          createdAt: data.createdAt,
          completedAt: data.completedAt,
        };

        setStatus(newStatus);
        setError(null);
        setRetryCount(0);

        // Call completion callback if status is completed or failed
        if (data.status === "completed" && onComplete) {
          onComplete(newStatus);
        } else if (data.status === "failed" && onError) {
          onError(data.error || "NFT generation failed");
        }

        return newStatus;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching NFT status:", errorMessage);

        // Only set error state if we've exhausted retries
        if (retryCount >= maxRetries) {
          setError(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
        } else {
          setRetryCount((prev) => prev + 1);
        }

        return null;
      }
    },
    [onComplete, onError, retryCount, maxRetries],
  );

  // Start monitoring when tokenId is provided
  useEffect(() => {
    if (!tokenId) {
      setStatus(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Initial fetch
    fetchStatus(tokenId);

    // Set up polling
    const interval = setInterval(async () => {
      const currentStatus = await fetchStatus(tokenId);

      // Stop polling if completed or failed
      if (
        currentStatus &&
        ["completed", "failed"].includes(currentStatus.status)
      ) {
        setIsLoading(false);
        clearInterval(interval);
      }
    }, pollInterval);

    // Cleanup
    return () => {
      clearInterval(interval);
      setIsLoading(false);
    };
  }, [tokenId, fetchStatus, pollInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (tokenId) {
      setRetryCount(0);
      fetchStatus(tokenId);
    }
  }, [tokenId, fetchStatus]);

  // Start generation function
  const startGeneration = useCallback(
    async (userAddress: string, nftTokenId: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/generateNFT", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenId: nftTokenId,
            userAddress,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to start NFT generation");
        }

        console.log("NFT generation started:", data);

        // Return job information
        return {
          jobId: data.jobId,
          tokenId: data.tokenId,
          status: data.status,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setIsLoading(false);
        if (onError) {
          onError(errorMessage);
        }
        throw err;
      }
    },
    [onError],
  );

  return {
    status,
    isLoading,
    error,
    retryCount,
    refresh,
    startGeneration,
    // Helper getters
    isGenerating: status?.status === "generating",
    isUploading: status?.status === "uploading",
    isCompleted: status?.status === "completed",
    isFailed: status?.status === "failed",
    hasImage: !!status?.imageUrl,
    hasMetadata: !!status?.metadataUrl,
  };
}
