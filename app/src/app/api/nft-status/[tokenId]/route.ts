import { NextRequest, NextResponse } from "next/server";

const NFT_LISTENER_SERVER_URL =
  process.env.NFT_LISTENER_SERVER_URL || "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } },
) {
  try {
    const { tokenId } = params;

    if (!tokenId || isNaN(parseInt(tokenId))) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }

    // Get job status from listener server
    const response = await fetch(`${NFT_LISTENER_SERVER_URL}/token/${tokenId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "NFT generation not found" },
          { status: 404 },
        );
      }
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }

    const { job } = await response.json();

    return NextResponse.json({
      success: true,
      tokenId: parseInt(tokenId),
      status: job.status,
      imageUrl: job.imageUrl,
      metadataUrl: job.metadataUrl,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    console.error("Error getting NFT status:", error);
    return NextResponse.json(
      { error: "Failed to get NFT status" },
      { status: 500 },
    );
  }
}
