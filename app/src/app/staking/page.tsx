"use client";

import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useState, useMemo, useRef } from "react";
import { CONTRACTS_ADDRESS } from "@/shared/lib/constants";
import { NFTStakingAbi, StakableNFTAbi } from "@/shared/lib/abis";
import { NFTCard } from "@/shared/components/NFTCard";
import { FloatingCoins } from "@/shared/components/FloatingCoins";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Badge } from "@/shared/ui/kit/badge";
import { Coins, Clock, Zap, TrendingUp, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPublicClient, webSocket } from "viem";
import { sepolia } from "viem/chains";

type TokenInfo = {
  tokenId: number;
  staked: boolean;
  pending?: bigint;
  stakedAt?: bigint;
  approved?: boolean;
};

export default function StakingPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, isPending, data: txHash } = useWriteContract();
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>(
    {},
  );
  const wsClient = useRef<ReturnType<typeof createPublicClient> | null>(null);

  const nftAddress = CONTRACTS_ADDRESS.StakableNFT;
  const stakingAddress = CONTRACTS_ADDRESS.NFTStaking;

  const unstaked = tokens.filter((t) => !t.staked);
  const staked = tokens.filter((t) => t.staked);

  // Initialize WebSocket client
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_RPC_URL;
    if (url && !wsClient.current) {
      try {
        wsClient.current = createPublicClient({
          chain: sepolia,
          transport: webSocket(url, { retryCount: 0 }),
        });
      } catch {}
    }
  }, []);

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
        let approved = false;

        // Check if NFT is approved for staking contract
        if (!staked) {
          try {
            const approvedAddress = (await publicClient.readContract({
              address: nftAddress,
              abi: StakableNFTAbi as any,
              functionName: "getApproved",
              args: [BigInt(id)],
            })) as string;
            approved =
              approvedAddress.toLowerCase() === stakingAddress.toLowerCase();

            // Also check if all tokens are approved
            if (!approved) {
              const isApprovedForAll = (await publicClient.readContract({
                address: nftAddress,
                abi: StakableNFTAbi as any,
                functionName: "isApprovedForAll",
                args: [address, stakingAddress],
              })) as boolean;
              approved = isApprovedForAll;
            }
          } catch {}
        }

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
        items.push({ tokenId: id, staked, pending, stakedAt, approved });
      }
      setTokens(items.sort((a, b) => a.tokenId - b.tokenId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [address, publicClient]);

  // Auto-reload after successful transaction
  useEffect(() => {
    if (txSuccess) {
      loadData();
    }
  }, [txSuccess]);

  // WebSocket subscriptions for real-time updates
  useEffect(() => {
    const client = wsClient.current;
    if (!client || !address) return;

    const unwatchStake = client.watchContractEvent?.({
      address: stakingAddress,
      abi: NFTStakingAbi as any,
      eventName: "NFTStaked",
      onLogs: (logs: any[]) => {
        for (const log of logs) {
          const owner = log.args?.owner as string;
          const tokenId = Number(log.args?.tokenId ?? 0);

          if (owner?.toLowerCase() === address.toLowerCase()) {
            setTokens((prev) =>
              prev.map((t) =>
                t.tokenId === tokenId ? { ...t, staked: true } : t,
              ),
            );
            setActionLoading((prev) => ({ ...prev, [tokenId]: false }));
          }
        }
      },
      onError: () => {},
    });

    const unwatchUnstake = client.watchContractEvent?.({
      address: stakingAddress,
      abi: NFTStakingAbi as any,
      eventName: "NFTUnstaked",
      onLogs: (logs: any[]) => {
        for (const log of logs) {
          const owner = log.args?.owner as string;
          const tokenId = Number(log.args?.tokenId ?? 0);

          if (owner?.toLowerCase() === address.toLowerCase()) {
            setTokens((prev) =>
              prev.map((t) =>
                t.tokenId === tokenId
                  ? { ...t, staked: false, pending: 0n }
                  : t,
              ),
            );
            setActionLoading((prev) => ({ ...prev, [tokenId]: false }));
          }
        }
      },
      onError: () => {},
    });

    const unwatchRewards = client.watchContractEvent?.({
      address: stakingAddress,
      abi: NFTStakingAbi as any,
      eventName: "RewardsClaimed",
      onLogs: (logs: any[]) => {
        for (const log of logs) {
          const user = log.args?.user as string;

          if (user?.toLowerCase() === address.toLowerCase()) {
            // Reset pending rewards for all staked tokens
            setTokens((prev) =>
              prev.map((t) => (t.staked ? { ...t, pending: 0n } : t)),
            );
          }
        }
      },
      onError: () => {},
    });

    // Watch for Approval events to reset loading state
    const unwatchApproval = client.watchContractEvent?.({
      address: nftAddress,
      abi: StakableNFTAbi as any,
      eventName: "Approval",
      onLogs: (logs: any[]) => {
        for (const log of logs) {
          const owner = log.args?.owner as string;
          const approved = log.args?.approved as string;
          const tokenId = Number(log.args?.tokenId ?? 0);

          if (
            owner?.toLowerCase() === address.toLowerCase() &&
            approved?.toLowerCase() === stakingAddress.toLowerCase()
          ) {
            // Update token approval state and reset loading
            setTokens((prev) =>
              prev.map((t) =>
                t.tokenId === tokenId ? { ...t, approved: true } : t,
              ),
            );
            setActionLoading((prev) => ({ ...prev, [tokenId]: false }));
          }
        }
      },
      onError: () => {},
    });

    // Watch for ApprovalForAll events
    const unwatchApprovalForAll = client.watchContractEvent?.({
      address: nftAddress,
      abi: StakableNFTAbi as any,
      eventName: "ApprovalForAll",
      onLogs: (logs: any[]) => {
        for (const log of logs) {
          const owner = log.args?.owner as string;
          const operator = log.args?.operator as string;
          const approved = log.args?.approved as boolean;

          if (
            owner?.toLowerCase() === address.toLowerCase() &&
            operator?.toLowerCase() === stakingAddress.toLowerCase() &&
            approved
          ) {
            // Update approval state for all unstaked tokens and reset loading
            setTokens((prev) =>
              prev.map((t) => (!t.staked ? { ...t, approved: true } : t)),
            );
            setActionLoading((prev) => {
              const newState = { ...prev };
              unstaked.forEach((token) => {
                if (!token.approved) {
                  newState[token.tokenId] = false;
                }
              });
              return newState;
            });
          }
        }
      },
      onError: () => {},
    });

    return () => {
      try {
        unwatchStake?.();
        unwatchUnstake?.();
        unwatchRewards?.();
        unwatchApproval?.();
        unwatchApprovalForAll?.();
      } catch {}
    };
  }, [address, stakingAddress, nftAddress, unstaked]);

  async function stakeSelected(ids: number[]) {
    if (!ids.length) return;

    // Set loading state for each token
    setActionLoading((prev) =>
      ids.reduce((acc, id) => ({ ...acc, [id]: true }), prev),
    );

    try {
      await writeContract({
        address: stakingAddress,
        abi: NFTStakingAbi as any,
        functionName: "stake",
        args: [ids.map((x) => BigInt(x))],
      });
    } catch (error) {
      // Reset loading state on error
      setActionLoading((prev) =>
        ids.reduce((acc, id) => ({ ...acc, [id]: false }), prev),
      );
      throw error;
    }
  }

  async function unstakeSelected(ids: number[]) {
    if (!ids.length) return;

    setActionLoading((prev) =>
      ids.reduce((acc, id) => ({ ...acc, [id]: true }), prev),
    );

    try {
      await writeContract({
        address: stakingAddress,
        abi: NFTStakingAbi as any,
        functionName: "unstake",
        args: [ids.map((x) => BigInt(x))],
      });
    } catch (error) {
      setActionLoading((prev) =>
        ids.reduce((acc, id) => ({ ...acc, [id]: false }), prev),
      );
      throw error;
    }
  }

  async function claimAll() {
    await writeContract({
      address: stakingAddress,
      abi: NFTStakingAbi as any,
      functionName: "claimAllRewards",
      args: [],
    });
  }

  async function approveNFT(tokenId: number) {
    setActionLoading((prev) => ({ ...prev, [tokenId]: true }));

    try {
      await writeContract({
        address: nftAddress,
        abi: StakableNFTAbi as any,
        functionName: "approve",
        args: [stakingAddress, BigInt(tokenId)],
      });

      // Don't optimistically update - wait for blockchain confirmation
      // The WebSocket event will handle the state update
    } catch (error) {
      setActionLoading((prev) => ({ ...prev, [tokenId]: false }));
      throw error;
    }
  }

  async function approveAllNFTs() {
    const unapprovedIds = unstaked
      .filter((t) => !t.approved)
      .map((t) => t.tokenId);
    setActionLoading((prev) =>
      unapprovedIds.reduce((acc, id) => ({ ...acc, [id]: true }), prev),
    );

    try {
      await writeContract({
        address: nftAddress,
        abi: StakableNFTAbi as any,
        functionName: "setApprovalForAll",
        args: [stakingAddress, true],
      });

      // Don't optimistically update - wait for blockchain confirmation
      // The WebSocket event will handle the state update
    } catch (error) {
      setActionLoading((prev) =>
        unapprovedIds.reduce((acc, id) => ({ ...acc, [id]: false }), prev),
      );
      throw error;
    }
  }

  const unapprovedCount = unstaked.filter((t) => !t.approved).length;
  const totalPendingRewards =
    staked.reduce((acc, t) => acc + Number(t.pending || 0n), 0) / 1e18;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 text-white">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">
            <Star className="h-5 w-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-sm font-medium text-transparent">
              NFT Staking
            </span>
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-5xl font-black text-transparent">
            STAKE & EARN
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Stake your Plumffel NFTs to earn passive rewards. The rarer your
            NFT, the higher your earning potential!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-purple-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-300">
                    Untaked NFTs
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {unstaked.length}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-500/20 bg-gradient-to-br from-pink-900/30 to-pink-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-300">
                    Staked NFTs
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {staked.length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-blue-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-300">
                    Pending Rewards
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {totalPendingRewards.toFixed(2)}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mb-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {unapprovedCount > 0 && (
            <Button
              onClick={approveAllNFTs}
              disabled={
                isPending || unstaked.some((t) => actionLoading[t.tokenId])
              }
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              {unstaked.some((t) => actionLoading[t.tokenId]) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Waiting for approvals...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Approve All NFTs ({unapprovedCount})
                </>
              )}
            </Button>
          )}

          <Button
            onClick={() =>
              stakeSelected(
                unstaked.filter((t) => t.approved).map((t) => t.tokenId),
              )
            }
            disabled={
              !unstaked.filter((t) => t.approved).length ||
              isPending ||
              unstaked.some((t) => actionLoading[t.tokenId])
            }
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Star className="mr-2 h-4 w-4" />
            Stake All Approved
          </Button>

          <Button
            onClick={() => unstakeSelected(staked.map((t) => t.tokenId))}
            disabled={!staked.length || isPending}
            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
          >
            <Clock className="mr-2 h-4 w-4" />
            Unstake All
          </Button>

          <Button
            onClick={claimAll}
            disabled={!staked.length || isPending}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Claim All Rewards
              </>
            )}
          </Button>

          <Button
            onClick={loadData}
            variant="outline"
            className="border-white/20 hover:bg-white/10"
          >
            Refresh
          </Button>
        </motion.div>

        {loading ? (
          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-white/10 bg-white/5">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Unstaked NFTs */}
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-purple-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Your NFTs ({unstaked.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unstaked.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Star className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No NFTs available for staking</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {unstaked.map((t) => (
                      <motion.div
                        key={t.tokenId}
                        className="space-y-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", damping: 25 }}
                      >
                        <NFTCard tokenId={t.tokenId} compact />

                        {!t.approved ? (
                          <Button
                            onClick={() => approveNFT(t.tokenId)}
                            disabled={isPending || actionLoading[t.tokenId]}
                            size="sm"
                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                          >
                            {actionLoading[t.tokenId] ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Waiting for approval...
                              </>
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => stakeSelected([t.tokenId])}
                            disabled={isPending || actionLoading[t.tokenId]}
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                          >
                            {actionLoading[t.tokenId] ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Staking...
                              </>
                            ) : (
                              "Stake"
                            )}
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staked NFTs */}
            <Card className="border-pink-500/20 bg-gradient-to-br from-pink-900/20 to-pink-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5 text-pink-400" />
                  Staked NFTs ({staked.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {staked.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No NFTs currently staked</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {staked.map((t) => (
                      <motion.div
                        key={t.tokenId}
                        className="relative space-y-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", damping: 25 }}
                      >
                        <div className="relative">
                          <NFTCard tokenId={t.tokenId} compact />
                          <FloatingCoins
                            active={t.staked && Number(t.pending || 0n) > 0}
                            count={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Badge
                            variant="secondary"
                            className="w-full justify-center border-blue-500/20 bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-300"
                          >
                            <Coins className="mr-1 h-3 w-3" />
                            {(Number(t.pending || 0n) / 1e18).toFixed(4)} $PFC
                          </Badge>

                          <Button
                            onClick={() => unstakeSelected([t.tokenId])}
                            disabled={isPending || actionLoading[t.tokenId]}
                            size="sm"
                            className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
                          >
                            {actionLoading[t.tokenId] ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Unstaking...
                              </>
                            ) : (
                              "Unstake"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
