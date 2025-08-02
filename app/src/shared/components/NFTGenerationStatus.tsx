"use client";

import React from "react";
import {
  useNFTGeneration,
  NFTGenerationStatus,
} from "@/shared/hooks/useNFTGeneration";

interface NFTGenerationStatusProps {
  tokenId: number | null;
  userAddress?: string;
  onComplete?: (status: NFTGenerationStatus) => void;
  onError?: (error: string) => void;
}

export function NFTGenerationStatusComponent({
  tokenId,
  userAddress,
  onComplete,
  onError,
}: NFTGenerationStatusProps) {
  const {
    status,
    isLoading,
    error,
    refresh,
    startGeneration,
    isGenerating,
    isUploading,
    isCompleted,
    isFailed,
    hasImage,
  } = useNFTGeneration(tokenId, { onComplete, onError });

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
  );

  // Status indicator
  const getStatusIcon = () => {
    if (isCompleted) return "✅";
    if (isFailed) return "❌";
    if (isUploading) return "📤";
    if (isGenerating) return "🎨";
    return "⏳";
  };

  const getStatusText = () => {
    if (!status) return "Waiting for generation to start...";

    switch (status.status) {
      case "pending":
        return "Generation pending...";
      case "generating":
        return "Creating your unique NFT...";
      case "uploading":
        return "Uploading to IPFS...";
      case "completed":
        return "NFT generated successfully!";
      case "failed":
        return `Generation failed: ${status.error || "Unknown error"}`;
      default:
        return "Unknown status";
    }
  };

  const getProgressPercentage = () => {
    if (!status) return 0;

    switch (status.status) {
      case "pending":
        return 10;
      case "generating":
        return 40;
      case "uploading":
        return 80;
      case "completed":
        return 100;
      case "failed":
        return 0;
      default:
        return 0;
    }
  };

  // Test generation button (for development)
  const handleTestGeneration = async () => {
    if (!userAddress || !tokenId) return;

    try {
      await startGeneration(userAddress, tokenId);
    } catch (error) {
      console.error("Failed to start generation:", error);
    }
  };

  if (!tokenId) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center">
        <p className="text-gray-600">No token ID provided</p>
        {userAddress && (
          <button
            onClick={() => handleTestGeneration()}
            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Test Generation
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <h3 className="mb-2 text-xl font-bold text-gray-800">
          NFT Generation #{tokenId}
        </h3>

        {/* Status Icon and Text */}
        <div className="mb-4 flex items-center justify-center space-x-3">
          <span className="text-2xl">{getStatusIcon()}</span>
          {isLoading && !isCompleted && !isFailed && <LoadingSpinner />}
        </div>

        <p className="text-sm text-gray-600">{getStatusText()}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isFailed ? "bg-red-500" : "bg-purple-600"
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      {/* Generation Steps */}
      <div className="mb-6 space-y-2">
        <div
          className={`flex items-center space-x-2 text-sm ${
            status?.status &&
            ["generating", "uploading", "completed"].includes(status.status)
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <span>
            {status?.status &&
            ["generating", "uploading", "completed"].includes(status.status)
              ? "✓"
              : "○"}
          </span>
          <span>Generate unique artwork</span>
        </div>

        <div
          className={`flex items-center space-x-2 text-sm ${
            status?.status && ["uploading", "completed"].includes(status.status)
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <span>
            {status?.status &&
            ["uploading", "completed"].includes(status.status)
              ? "✓"
              : "○"}
          </span>
          <span>Upload to IPFS</span>
        </div>

        <div
          className={`flex items-center space-x-2 text-sm ${
            status?.status === "completed" ? "text-green-600" : "text-gray-400"
          }`}
        >
          <span>{status?.status === "completed" ? "✓" : "○"}</span>
          <span>NFT ready!</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <button
            onClick={refresh}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Completed State */}
      {isCompleted && hasImage && (
        <div className="text-center">
          <div className="mb-4">
            <img
              src={status?.imageUrl}
              alt={`NFT #${tokenId}`}
              className="mx-auto h-32 w-32 rounded-lg shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="space-y-2">
            {status?.imageUrl && (
              <a
                href={status.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                View Image
              </a>
            )}

            {status?.metadataUrl && (
              <a
                href={status.metadataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                View Metadata
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex justify-center space-x-2">
        {!isCompleted && !isFailed && (
          <button
            onClick={refresh}
            disabled={isLoading}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Refresh
          </button>
        )}

        {/* Test generation button for development */}
        {process.env.NODE_ENV === "development" && userAddress && (
          <button
            onClick={handleTestGeneration}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
          >
            Test Generation
          </button>
        )}
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === "development" && status && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
            {JSON.stringify(status, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
