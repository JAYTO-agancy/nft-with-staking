"use client";

import React from "react";
import { useContractStats } from "@/shared/hooks/useContractStats";

interface ContractStatsProps {
  className?: string;
}

export function ContractStatsComponent({ className = "" }: ContractStatsProps) {
  const { stats, isLoading, error, refresh, totalSupply, totalMinted } =
    useContractStats();

  if (isLoading) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            <div className="h-6 rounded bg-gray-200"></div>
            <div className="h-6 w-3/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800">
              Contract Statistics
            </h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Contract Statistics
        </h3>
        <button
          onClick={refresh}
          className="text-gray-500 hover:text-gray-700"
          title="Refresh stats"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalSupply}</div>
          <div className="text-sm text-gray-600">Total Supply</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalMinted}</div>
          <div className="text-sm text-gray-600">Total Minted</div>
        </div>
      </div>

      {stats?.lastMintBlock && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            Last mint: Block #{stats.lastMintBlock}
            {stats.lastMintTimestamp && (
              <span className="ml-2">
                ({new Date(stats.lastMintTimestamp * 1000).toLocaleDateString()}
                )
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-600">
          Progress: {totalMinted} / {totalSupply} (
          {totalSupply > 0 ? Math.round((totalMinted / totalSupply) * 100) : 0}
          %)
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${totalSupply > 0 ? (totalMinted / totalSupply) * 100 : 0}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
