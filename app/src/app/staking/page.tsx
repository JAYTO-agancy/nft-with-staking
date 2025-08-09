"use client";

import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";
import { NFTStakingAbi, StakableNFTAbi } from "@/shared/lib/abis";
import Image from "next/image";
import { NFTCard } from "@/shared/components/NFTCard";

type TokenInfo = {
  tokenId: number;
  staked: boolean;
  pending?: bigint;
  stakedAt?: bigint;
};

export default function StakingPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, isPending } = useWriteContract();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const nftAddress = CONTRACTS_ADDRESS.StakableNFT;
  const stakingAddress = CONTRACTS_ADDRESS.NFTStaking;

  async function loadData() {
    if (!address || !publicClient) return;
    setLoading(true);
    try {
      const ownedCount = (await publicClient.readContract({
        address: nftAddress,
        abi: StakableNFTAbi as any,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;

      const ownedTokenIds: number[] = [];
      for (let i = 0n; i < ownedCount; i++) {
        const tid = (await publicClient.readContract({
          address: nftAddress,
          abi: StakableNFTAbi as any,
          functionName: "tokenOfOwnerByIndex",
          args: [address, i],
        })) as bigint;
        ownedTokenIds.push(Number(tid));
      }

      const stakedIds = (await publicClient.readContract({
        address: stakingAddress,
        abi: NFTStakingAbi as any,
        functionName: "getUserStakedTokens",
        args: [address],
      })) as bigint[];

      const stakedSet = new Set(stakedIds.map((x) => Number(x)));
      const allIds = [...new Set([...ownedTokenIds, ...Array.from(stakedSet)])];

      const items: TokenInfo[] = [];
      for (const id of allIds) {
        const staked = stakedSet.has(id);
        let pending: bigint | undefined;
        let stakedAt: bigint | undefined;
        if (staked) {
          const info = (await publicClient.readContract({
            address: stakingAddress,
            abi: NFTStakingAbi as any,
            functionName: "getStakeInfo",
            args: [BigInt(id)],
          })) as any;
          stakedAt = BigInt(info.stakedAt ?? info[1] ?? 0);
          pending = (await publicClient.readContract({
            address: stakingAddress,
            abi: NFTStakingAbi as any,
            functionName: "getTokenPendingRewards",
            args: [BigInt(id)],
          })) as bigint;
        }
        items.push({ tokenId: id, staked, pending, stakedAt });
      }
      setTokens(items.sort((a, b) => a.tokenId - b.tokenId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [address, publicClient]);

  async function stakeSelected(ids: number[]) {
    if (!ids.length) return;
    await writeContract({
      address: stakingAddress,
      abi: NFTStakingAbi as any,
      functionName: "stake",
      args: [ids.map((x) => BigInt(x))],
    });
    await loadData();
  }

  async function unstakeSelected(ids: number[]) {
    if (!ids.length) return;
    await writeContract({
      address: stakingAddress,
      abi: NFTStakingAbi as any,
      functionName: "unstake",
      args: [ids.map((x) => BigInt(x))],
    });
    await loadData();
  }

  async function claimAll() {
    await writeContract({
      address: stakingAddress,
      abi: NFTStakingAbi as any,
      functionName: "claimAllRewards",
      args: [],
    });
    await loadData();
  }

  const unstaked = tokens.filter((t) => !t.staked);
  const staked = tokens.filter((t) => t.staked);

  return (
    <div className="container mx-auto px-4 py-10 text-white">
      <h1 className="mb-6 text-3xl font-bold">Staking</h1>

      <div className="mb-6 flex gap-3">
        <button
          className="rounded bg-purple-600 px-4 py-2 disabled:opacity-50"
          onClick={() => stakeSelected(unstaked.map((t) => t.tokenId))}
          disabled={!unstaked.length || isPending}
        >
          Stake All Owned
        </button>
        <button
          className="rounded bg-pink-600 px-4 py-2 disabled:opacity-50"
          onClick={() => unstakeSelected(staked.map((t) => t.tokenId))}
          disabled={!staked.length || isPending}
        >
          Unstake All
        </button>
        <button
          className="rounded bg-blue-600 px-4 py-2 disabled:opacity-50"
          onClick={claimAll}
          disabled={!staked.length || isPending}
        >
          Claim All Rewards
        </button>
        <button
          className="rounded border border-white/20 px-4 py-2"
          onClick={loadData}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Your NFTs (Unstaked)</h2>
            <div className="grid grid-cols-2 gap-4">
              {unstaked.map((t) => (
                <div key={t.tokenId}>
                  <NFTCard tokenId={t.tokenId} compact />
                  <button
                    className="mt-2 w-full rounded bg-purple-600 px-3 py-2 text-sm"
                    onClick={() => stakeSelected([t.tokenId])}
                  >
                    Stake
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Staked NFTs</h2>
            <div className="grid grid-cols-2 gap-4">
              {staked.map((t) => (
                <div key={t.tokenId}>
                  <NFTCard tokenId={t.tokenId} compact />
                  <div className="mt-2 mb-2 text-xs text-gray-300">
                    Pending: {t.pending ? Number(t.pending) / 1e18 : 0} RWD
                  </div>
                  <button
                    className="w-full rounded bg-pink-600 px-3 py-2 text-sm"
                    onClick={() => unstakeSelected([t.tokenId])}
                  >
                    Unstake
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
