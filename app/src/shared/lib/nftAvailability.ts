"use client";

import { BASE_URL_NFT } from "@/shared/lib/constants";

export function getImageUrl(tokenId: number): string {
  return `${BASE_URL_NFT}/${tokenId}.png`;
}

export function getJsonUrl(tokenId: number): string {
  return `${BASE_URL_NFT}/${tokenId}.json`;
}

export async function checkS3ImageAvailable(
  tokenId: number,
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    const imageUrl = getImageUrl(tokenId);
    const res = await fetch(imageUrl, { method: "HEAD", signal });
    return res.ok;
  } catch {
    return false;
  }
}

type WaitOptions = {
  maxAttempts?: number;
  baseMs?: number; // base backoff
  maxMs?: number; // cap
  signal?: AbortSignal;
};

export async function waitForS3ImageAvailable(
  tokenId: number,
  opts: WaitOptions = {},
): Promise<boolean> {
  const { maxAttempts = 8, baseMs = 1500, maxMs = 10000, signal } = opts;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) return false;

    const ok = await checkS3ImageAvailable(tokenId, signal);
    if (ok) return true;

    const waitMs = Math.min(baseMs * 2 ** (attempt - 1), maxMs);
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, waitMs);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(t);
          reject(new Error("aborted"));
        },
        { once: true },
      );
    }).catch(() => {});
  }
  return false;
}
