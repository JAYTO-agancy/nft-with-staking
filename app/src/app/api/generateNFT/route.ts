import { NextRequest, NextResponse } from "next/server";
import { generateNFTWithRarity } from "@/shared/lib/nft/generator";

const RARITY_NAMES = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary",
} as const;

// Функция для получения следующего доступного ID
async function getNextNftId(): Promise<number> {
  // const lastNft = await prisma.generatedNft.findFirst({
  //   orderBy: { edition: "desc" },
  // });

  // return (lastNft?.edition || 0) + 1;
  return Math.floor(Math.random() * 10000);
}

export async function POST(request: NextRequest) {
  try {
    // Получаем статистику
    // const stats = await getRarityStats();

    // const totalGenerated = stats.reduce((sum, r) => sum + r.generated, 0);
    // const totalLimit = stats.reduce((sum, r) => sum + r.limit, 0);

    // if (totalGenerated >= totalLimit) {
    //   return NextResponse.json(
    //     { error: "All NFTs have been generated" },
    //     { status: 400 },
    //   );
    // }

    // Выбираем редкость на основе текущих шансов
    // const selectedRarityLevel = await selectRarityByChance();

    // Проверяем, можно ли сгенерировать NFT этой редкости
    const canGenerate = true;
    // const canGenerate = await canGenerateRarity(selectedRarityLevel);

    // if (!canGenerate) {
    //   // Если нет, обновляем шансы и пробуем снова
    //   await updateRarityChances();
    //   return NextResponse.json(
    //     { error: "Selected rarity limit reached, please try again" },
    //     { status: 400 },
    //   );
    // }

    // const rarityName = RARITY_NAMES[selectedRarityLevel];

    // Если нужно проверить конкретную редкость
    const rarityName = RARITY_NAMES[5];

    // Получаем следующий ID для NFT
    const nextId = await getNextNftId();

    // Генерируем NFT
    console.log(`Generating ${rarityName} NFT with ID ${nextId}...`);
    const result = await generateNFTWithRarity(rarityName, nextId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Generation failed" },
        { status: 500 },
      );
    }

    // Сохраняем в базу данных
    // const nft = await prisma.generatedNft.create({
    //   data: {
    //     edition: result.edition!,
    //     name: result.metadata.name,
    //     rarityLevel: selectedRarityLevel,
    //     rarityName: rarityName,
    //     dna: result.metadata.dna,
    //     imageUrl: result.imageUrl!,
    //     jsonUrl: result.jsonUrl!, // Добавляем URL к JSON
    //     metadata: result.metadata,
    //   },
    // });

    // Увеличиваем счетчик редкости
    // await incrementRarityCount(selectedRarityLevel);

    // Обновляем шансы если необходимо
    // await updateRarityChances();

    // Получаем обновленную статистику
    // const updatedStats = await getRarityStats();

    return NextResponse.json({
      success: true,
      // nft: {
      //   id: nft.id,
      //   edition: nft.edition,
      //   name: nft.name,
      //   rarity: nft.rarityName,
      //   imageUrl: nft.imageUrl,
      //   jsonUrl: nft.jsonUrl,
      //   metadata: nft.metadata,
      // },
      // stats: updatedStats.map((r) => ({
      //   rarity: r.rarityName,
      //   generated: r.generated,
      //   limit: r.limit,
      //   remaining: r.remaining,
      //   currentChance: r.currentChance.toFixed(2) + "%",
      // })),
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
