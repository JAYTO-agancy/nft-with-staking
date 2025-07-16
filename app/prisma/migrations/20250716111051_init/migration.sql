-- CreateTable
CREATE TABLE "generated_nft" (
    "id" TEXT NOT NULL,
    "edition" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rarityLevel" INTEGER NOT NULL,
    "rarityName" TEXT NOT NULL,
    "dna" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "jsonUrl" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_nft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_rarity" (
    "id" TEXT NOT NULL,
    "rarityLevel" INTEGER NOT NULL,
    "rarityName" TEXT NOT NULL,
    "generated" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,
    "baseChance" DOUBLE PRECISION NOT NULL,
    "currentChance" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nft_rarity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generated_nft_edition_key" ON "generated_nft"("edition");

-- CreateIndex
CREATE UNIQUE INDEX "generated_nft_dna_key" ON "generated_nft"("dna");

-- CreateIndex
CREATE UNIQUE INDEX "nft_rarity_rarityLevel_key" ON "nft_rarity"("rarityLevel");
