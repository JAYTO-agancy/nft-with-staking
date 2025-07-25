"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/shared/ui/kit/button";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState } from "react";
import { StakableNFTAbi } from "@/shared/lib/abis/StakabeNFT.abi";

const CONTRACT_ADDRESS = "0x43ccC21884F39E40edef71980C93aD87FDe99763";

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

  async function handleMint() {
    setMinting(true);
    setMintedNft(null);
    try {
      const secret = randomBytes32();
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: StakableNFTAbi,
        functionName: "mint",
        args: [1n, secret as `0x${string}`],
        value: BigInt("10000000000000000"), // если mint платный
      });
      // TODO: после успеха — запрос к backend для генерации PNG/JSON и загрузки в Pinata
      // setMintedNft({ imageUrl, rarity, txHash });
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="container flex flex-col items-center gap-8 py-10">
      <ConnectButton />
      {isConnected && (
        <Button onClick={handleMint} disabled={minting || txPending}>
          {minting || txPending ? "Minting..." : "Mint NFT"}
        </Button>
      )}
      {txHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          View on Etherscan
        </a>
      )}
      {mintedNft && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <img
            src={mintedNft.imageUrl}
            alt="Your NFT"
            className="h-64 w-64 rounded-xl border"
          />
          <div className="text-lg font-bold">Rarity: {mintedNft.rarity}</div>
        </div>
      )}
    </div>
  );
}
