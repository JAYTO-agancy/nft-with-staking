"use client";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { useEffect, useMemo, useRef, useState } from "react";
import { StakableNFTAbi } from "@/shared/lib/abis";
import { HeroSection } from "./_sections/HeroSection";
import { HowBuySection } from "./_sections/HowBuySection";
import { MintSection } from "./_sections/MintSection";
import { LastMintedSection } from "./_sections/LastMintedSection";
import { StatsSection } from "./_sections/StatsSection";
import { ProjectStorySection } from "./_sections/ProjectStorySection";
import { CONTRACTS_ADDRESS, BASE_URL_NFT } from "@/shared/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import Image from "next/image";
import { NFTCard } from "@/shared/components/NFTCard";
import { createPublicClient, webSocket } from "viem";
import { sepolia } from "viem/chains";

function randomBytes32() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [minting, setMinting] = useState(false);
  const [mintedNft, setMintedNft] = useState<null | {
    imageUrl: string;
    rarity: string;
    txHash: string;
  }>(null);
  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: txPending, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

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

  // Listen for NFTMinted for current user and capture the freshly minted item
  useEffect(() => {
    if (!address) return;
    if (!txSuccess || !txHash) return;

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
            logTxHash === txHash
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
                imageUrl,
                rarity,
                txHash: logTxHash,
              });
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
  }, [address, txSuccess, txHash, wsClient, publicClient]);

  async function handleMint() {
    setMinting(true);
    setMintedNft(null);
    try {
      const secret = randomBytes32();
      await writeContract({
        address: CONTRACTS_ADDRESS.StakableNFT,
        abi: StakableNFTAbi,
        functionName: "mint",
        args: [1n, secret as `0x${string}`],
        value: BigInt("10000000000000000"),
      });
      // TODO: после успеха — запрос к backend для генерации PNG/JSON и загрузки в Pinata
      // setMintedNft({ imageUrl, rarity, txHash });
    } finally {
      setMinting(false);
    }
  }

  return (
    <>
      <HeroSection onMint={isConnected ? handleMint : undefined} />
      <LastMintedSection />
      <MintSection onMint={handleMint} mintedNft={mintedNft} />
      <HowBuySection />
      <StatsSection />
      <ProjectStorySection />

      {/* Mint success modal */}
      <Dialog
        open={!!mintedNft}
        onOpenChange={(open) => !open && setMintedNft(null)}
      >
        <DialogContent className="border-white/10 bg-black/80">
          <DialogHeader>
            <DialogTitle>Mint Successful</DialogTitle>
          </DialogHeader>
          {mintedNft && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-64">
                <NFTCard
                  imageUrl={mintedNft.imageUrl}
                  rarity={mintedNft.rarity}
                  showNewBadge
                />
              </div>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-400 underline"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
