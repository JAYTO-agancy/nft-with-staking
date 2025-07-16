import prisma from "@/shared/lib/prisma";

async function initRarity() {
  const rarityData = [
    {
      rarityLevel: 1,
      rarityName: "Common",
      limit: 6000,
      baseChance: 60.0,
      currentChance: 60.0,
    },
    {
      rarityLevel: 2,
      rarityName: "Uncommon",
      limit: 2500,
      baseChance: 25.0,
      currentChance: 25.0,
    },
    {
      rarityLevel: 3,
      rarityName: "Rare",
      limit: 1000,
      baseChance: 10.0,
      currentChance: 10.0,
    },
    {
      rarityLevel: 4,
      rarityName: "Epic",
      limit: 450,
      baseChance: 4.5,
      currentChance: 4.5,
    },
    {
      rarityLevel: 5,
      rarityName: "Legendary",
      limit: 50,
      baseChance: 0.5,
      currentChance: 0.5,
    },
  ];

  for (const data of rarityData) {
    await prisma.nftRarity.upsert({
      where: { rarityLevel: data.rarityLevel },
      update: {},
      create: data,
    });
  }

  console.log("Rarity data initialized");
}

initRarity()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
