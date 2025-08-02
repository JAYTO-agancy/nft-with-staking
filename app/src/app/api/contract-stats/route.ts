import { NextRequest, NextResponse } from "next/server";

const NFT_LISTENER_SERVER_URL =
  process.env.NFT_LISTENER_SERVER_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    // Get contract stats from listener server
    const response = await fetch(`${NFT_LISTENER_SERVER_URL}/contract/stats`);

    if (!response.ok) {
      throw new Error(`Failed to get contract stats: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      contractStats: data.contractStats,
    });
  } catch (error) {
    console.error("Error getting contract stats:", error);
    return NextResponse.json(
      { error: "Failed to get contract stats" },
      { status: 500 },
    );
  }
}
