"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useAccount, usePublicClient } from "wagmi";
import { createPublicClient, webSocket } from "viem";
import { sepolia } from "viem/chains";
import { StakableNFTAbi } from "@/shared/lib/abis/StakabeNFT.abi";
import { CONTRACTS_ADDRESS, BASE_URL_NFT } from "@/shared/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { NFTCard } from "@/shared/components/NFTCard";

type MintedNFT = {
  tokenId: number;
  imageUrl: string;
  rarity: string;
  txHash: string;
};

type MintNotificationContextType = {
  showMintNotification: (txHash: string) => void;
  hideMintNotification: () => void;
};

const MintNotificationContext =
  createContext<MintNotificationContextType | null>(null);

export function useMintNotification() {
  const context = useContext(MintNotificationContext);
  if (!context) {
    throw new Error(
      "useMintNotification must be used within MintNotificationProvider",
    );
  }
  return context;
}

type Props = {
  children: ReactNode;
};

export function MintNotificationProvider({ children }: Props) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [mintedNft, setMintedNft] = useState<MintedNFT | null>(null);
  const [watchingTxHash, setWatchingTxHash] = useState<string | null>(null);

  const wsClient = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_WS_RPC_URL;
    if (!url) return null;
    try {
      return createPublicClient({
        chain: sepolia,
        transport: webSocket(url, { retryCount: 0 }),
      });
    } catch {
      return null;
    }
  }, []);

  // Function to check if NFT image is available on S3
  const checkImageAvailability = async (tokenId: number): Promise<boolean> => {
    try {
      const imageUrl = `${BASE_URL_NFT}/${tokenId}.png`;
      const response = await fetch(imageUrl, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Function to wait for S3 image with retries
  const waitForS3Image = async (
    tokenId: number,
    maxAttempts = 10,
  ): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const isAvailable = await checkImageAvailability(tokenId);
      if (isAvailable) {
        return true;
      }
      // Wait with exponential backoff: 2s, 4s, 8s, 16s, then 30s
      const delay = attempt <= 4 ? Math.pow(2, attempt) * 1000 : 30000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return false;
  };

  // Listen for NFTMinted events for current user
  useEffect(() => {
    if (!address || !watchingTxHash) return;

    const abi = StakableNFTAbi as any;
    const client = (wsClient ?? publicClient) as any;
    if (!client) return;

    const unwatch = client.watchContractEvent?.({
      address: CONTRACTS_ADDRESS.StakableNFT,
      abi,
      eventName: "NFTMinted",
      onLogs: async (logs: any[]) => {
        for (const log of logs) {
          const to = log.args?.to as `0x${string}` | undefined;
          const tokenId = Number(log.args?.tokenId ?? 0);
          const rarityIdx = Number(log.args?.rarity ?? 0);
          const logTxHash = log.transactionHash as string;

          // Filter to current user's mint and matching txHash
          if (
            to?.toLowerCase() === address.toLowerCase() &&
            logTxHash === watchingTxHash
          ) {
            const RARITY_NAMES = [
              "Common",
              "Uncommon",
              "Rare",
              "Epic",
              "Legendary",
            ];
            const rarity = RARITY_NAMES[rarityIdx] ?? "Unknown";

            // Wait for S3 image to be available
            const imageAvailable = await waitForS3Image(tokenId);

            if (imageAvailable) {
              const imageUrl = `${BASE_URL_NFT}/${tokenId}.png`;
              setMintedNft({
                tokenId,
                imageUrl,
                rarity,
                txHash: logTxHash,
              });
              setWatchingTxHash(null); // Stop watching after successful detection
            }
          }
        }
      },
      onError: () => {},
    });

    return () => {
      try {
        unwatch?.();
      } catch {}
    };
  }, [address, watchingTxHash, wsClient, publicClient]);

  const showMintNotification = (txHash: string) => {
    setWatchingTxHash(txHash);
  };

  const hideMintNotification = () => {
    setMintedNft(null);
    setWatchingTxHash(null);
  };

  const contextValue = {
    showMintNotification,
    hideMintNotification,
  };

  return (
    <MintNotificationContext.Provider value={contextValue}>
      {children}

      {/* Global Mint Success Modal */}
      <Dialog
        open={!!mintedNft}
        onOpenChange={(open) => !open && hideMintNotification()}
      >
        <DialogContent className="border-white/10 bg-black/80">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-center text-2xl font-bold text-transparent">
              🎉 Mint Successful!
            </DialogTitle>
          </DialogHeader>
          {mintedNft && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="w-64">
                <NFTCard
                  tokenId={mintedNft.tokenId}
                  imageUrl={mintedNft.imageUrl}
                  rarity={mintedNft.rarity}
                  showNewBadge
                />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-gray-300">
                  Congratulations! You've successfully minted a{" "}
                  <span className="font-bold text-white">
                    {mintedNft.rarity}
                  </span>{" "}
                  Plumffel!
                </p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${mintedNft.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm text-blue-400 underline transition-colors hover:text-blue-300"
                >
                  View Transaction on Etherscan
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MintNotificationContext.Provider>
  );
}
