import prisma from "../prisma";

export interface RarityChances {
  [key: number]: number;
}

export async function getRarityStats() {
  const rarities = await prisma.nftRarity.findMany({
    orderBy: { rarityLevel: "asc" },
  });

  return rarities.map((r) => ({
    ...r,
    remaining: r.limit - r.generated,
    percentGenerated: (r.generated / r.limit) * 100,
  }));
}

export async function updateRarityChances() {
  const rarities = await getRarityStats();

  // Находим редкости, которые достигли лимита
  const exhaustedRarities = rarities.filter((r) => r.remaining <= 0);
  const activeRarities = rarities.filter((r) => r.remaining > 0);

  if (exhaustedRarities.length === 0) {
    return; // Ничего не перераспределяем
  }

  // Суммируем шансы исчерпанных редкостей
  const exhaustedChance = exhaustedRarities.reduce(
    (sum, r) => sum + r.currentChance,
    0,
  );

  // Перераспределяем шансы пропорционально между активными редкостями
  for (const rarity of activeRarities) {
    const proportionalIncrease = (rarity.currentChance / 100) * exhaustedChance;
    const newChance = rarity.currentChance + proportionalIncrease;

    await prisma.nftRarity.update({
      where: { rarityLevel: rarity.rarityLevel },
      data: { currentChance: newChance },
    });
  }

  // Устанавливаем 0 для исчерпанных редкостей
  for (const rarity of exhaustedRarities) {
    await prisma.nftRarity.update({
      where: { rarityLevel: rarity.rarityLevel },
      data: { currentChance: 0 },
    });
  }
}

type Rarity = 1 | 2 | 3 | 4 | 5;
export async function selectRarityByChance(): Promise<Rarity> {
  const rarities = await prisma.nftRarity.findMany({
    where: { currentChance: { gt: 0 } },
    orderBy: { rarityLevel: "asc" },
  });

  const totalChance = rarities.reduce((sum, r) => sum + r.currentChance, 0);
  let random = Math.random() * totalChance;

  for (const rarity of rarities) {
    random -= rarity.currentChance;
    if (random <= 0) {
      return rarity.rarityLevel as Rarity;
    }
  }

  // Fallback на Common
  return 1;
}

export async function canGenerateRarity(rarityLevel: number): Promise<boolean> {
  const rarity = await prisma.nftRarity.findUnique({
    where: { rarityLevel },
  });

  if (!rarity) return false;
  return rarity.generated < rarity.limit;
}

export async function incrementRarityCount(rarityLevel: number) {
  await prisma.nftRarity.update({
    where: { rarityLevel },
    data: { generated: { increment: 1 } },
  });
}
