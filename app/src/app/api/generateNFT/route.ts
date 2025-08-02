import { NextRequest, NextResponse } from "next/server";

const NFT_LISTENER_SERVER_URL =
  process.env.NFT_LISTENER_SERVER_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const { tokenId, userAddress } = await request.json();

    if (!tokenId || !userAddress) {
      return NextResponse.json(
        { error: "tokenId and userAddress are required" },
        { status: 400 },
      );
    }

    // Check if generation job already exists for this token
    try {
      const existingJobResponse = await fetch(
        `${NFT_LISTENER_SERVER_URL}/token/${tokenId}`,
      );

      if (existingJobResponse.ok) {
        const { job } = await existingJobResponse.json();
        return NextResponse.json({
          success: true,
          jobId: job.id,
          status: job.status,
          tokenId: job.tokenId,
          message: "Generation job already exists",
        });
      }
    } catch (error) {
      // Job doesn't exist, which is fine - we'll create a new one
      console.log("No existing job found, creating new one");
    }

    // Create a new generation job (for testing purposes)
    const response = await fetch(`${NFT_LISTENER_SERVER_URL}/test/create-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokenId,
        userAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create generation job: ${response.statusText}`,
      );
    }

    const { job } = await response.json();

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      tokenId: job.tokenId,
      message: "Generation job created successfully",
    });
  } catch (error) {
    console.error("Error creating generation job:", error);
    return NextResponse.json(
      { error: "Failed to create generation job" },
      { status: 500 },
    );
  }
}

// GET endpoint для получения текущей статистики
// export async function GET() {
//   try {
//     const stats = await getRarityStats();

//     return NextResponse.json({
//       stats: stats.map((r) => ({
//         rarity: r.rarityName,
//         generated: r.generated,
//         limit: r.limit,
//         remaining: r.remaining,
//         baseChance: r.baseChance.toFixed(2) + "%",
//         currentChance: r.currentChance.toFixed(2) + "%",
//         percentGenerated: r.percentGenerated.toFixed(2) + "%",
//       })),
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch statistics" },
//       { status: 500 },
//     );
//   }
// }
