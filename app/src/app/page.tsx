"use client";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState } from "react";
import { StakableNFTAbi } from "@/shared/lib/abis";
import { HeroSection } from "./_sections/HeroSection";
import { HowBuySection } from "./_sections/HowBuySection";
import { MintSection } from "./_sections/MintSection";
import { LastMintedSection } from "./_sections/LastMintedSection";
import { StatsSection } from "./_sections/StatsSection";
import { ProjectStorySection } from "./_sections/ProjectStorySection";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";

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
  const { isConnected } = useAccount();
  const [minting, setMinting] = useState(false);
  const [mintedNft, setMintedNft] = useState<null | {
    imageUrl: string;
    rarity: string;
    txHash: string;
  }>(null);
  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: txPending, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

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
    </>
  );
}
