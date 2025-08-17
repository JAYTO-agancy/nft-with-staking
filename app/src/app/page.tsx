"use client";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useEffect } from "react";
import { StakableNFTAbi } from "@/shared/lib/abis";
import { HeroSection } from "./_sections/HeroSection";
import { HowBuySection } from "./_sections/HowBuySection";
import { MintSection } from "./_sections/MintSection";
import { LastMintedSection } from "./_sections/LastMintedSection";
import { StatsSection } from "./_sections/StatsSection";
import { ProjectStorySection } from "./_sections/ProjectStorySection";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";
import { useMintNotification } from "@/shared/context/mint-notification";

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
  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: txPending, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });
  const { showMintNotification } = useMintNotification();

  // Trigger global mint notification when transaction succeeds
  useEffect(() => {
    if (txSuccess && txHash) {
      showMintNotification(txHash);
    }
  }, [txSuccess, txHash, showMintNotification]);

  async function handleMint() {
    setMinting(true);
    try {
      const secret = randomBytes32();
      await writeContract({
        address: CONTRACTS_ADDRESS.StakableNFT,
        abi: StakableNFTAbi,
        functionName: "mint",
        args: [1n, secret as `0x${string}`],
        value: BigInt("10000000000000000"),
      });
    } finally {
      setMinting(false);
    }
  }

  return (
    <>
      <HeroSection onMint={isConnected ? handleMint : undefined} />
      <LastMintedSection />
      <MintSection onMint={handleMint} />
      <HowBuySection />
      <StatsSection />
      <ProjectStorySection />
    </>
  );
}
