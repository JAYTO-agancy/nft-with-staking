import { useState, useEffect } from "react";

export interface ContractStats {
  totalSupply: number;
  totalMinted: number;
  lastMintBlock?: number;
  lastMintTimestamp?: number;
}

export function useContractStats() {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/contract-stats");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get contract stats");
      }

      setStats(data.contractStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching contract stats:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refresh = () => {
    fetchStats();
  };

  return {
    stats,
    isLoading,
    error,
    refresh,
    // Helper getters
    totalSupply: stats?.totalSupply || 0,
    totalMinted: stats?.totalMinted || 0,
    lastMintBlock: stats?.lastMintBlock,
    lastMintTimestamp: stats?.lastMintTimestamp,
  };
}
