interface GenerationResult {
  success: boolean;
  edition?: number;
  rarity?: string;
  metadata?: any;
  imageUrl?: string;
  jsonUrl?: string;
  error?: string;
}

import { uploadFileToPinata } from './pinata';

export async function generateNFTWithRarity(
  rarityName: string,
  nftId: number,
): Promise<GenerationResult> {
  // Используем динамические импорты только в runtime
  const { spawn } = await import("child_process");
  const path = await import("path");
  const fs = await import("fs/promises");

  return new Promise((resolve) => {
    const generatorPath = path.join(process.cwd(), "../nft-generator-hashlips");

    // Используем полный путь к index.js
    const indexPath = path.join(generatorPath, "index.js");

    // Генерируем всегда 1 NFT с нужной редкостью
    const childProcess = spawn(process.execPath, [indexPath, rarityName, "1"], {
      cwd: generatorPath,
      env: { ...process.env, NODE_ENV: "production" },
    });

    let outputData = "";
    let errorData = "";

    childProcess.stdout.on("data", (data: Buffer) => {
      outputData += data.toString();
      console.log(`Generator output: ${data}`);
    });

    childProcess.stderr.on("data", (data: Buffer) => {
      errorData += data.toString();
      console.error(`Generator error: ${data}`);
    });

    childProcess.on("close", async (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: errorData || "Generation failed",
        });
        return;
      }

      try {
        const buildDir = path.join(generatorPath, "build");

        // Генератор всегда создает 1.json и 1.png
        const sourceJsonPath = path.join(buildDir, "json", "1.json");
        const sourceImagePath = path.join(buildDir, "images", "1.png");

        // Проверяем существование файлов
        try {
          await fs.access(sourceJsonPath);
          await fs.access(sourceImagePath);
        } catch (error) {
          console.error("Source files not found:", error);
          throw new Error("Generated files not found");
        }

        // Читаем metadata
        const metadataContent = await fs.readFile(sourceJsonPath, "utf-8");
        const metadata = JSON.parse(metadataContent);

        // Обновляем edition в metadata на правильный ID
        metadata.edition = nftId;
        if (metadata.name) {
          // Обновляем имя если оно содержит #1
          metadata.name = metadata.name.replace(/#\d+/, `#${nftId}`);
        }

        // Создаем директории в public/nft
        const publicNftDir = path.join(process.cwd(), "public", "nft");
        const publicImagesDir = path.join(publicNftDir, "images");
        const publicJsonDir = path.join(publicNftDir, "json");

        await fs.mkdir(publicImagesDir, { recursive: true });
        await fs.mkdir(publicJsonDir, { recursive: true });

        // Копируем файлы с новыми именами
        const imageDest = path.join(publicImagesDir, `${nftId}.png`);
        const jsonDest = path.join(publicJsonDir, `${nftId}.json`);

        // Копируем изображение
        await fs.copyFile(sourceImagePath, imageDest);

        // Записываем обновленный JSON
        await fs.writeFile(jsonDest, JSON.stringify(metadata, null, 2));

        console.log(`✅ NFT files saved: ${imageDest} and ${jsonDest}`);

        // --- Pinata upload ---
        let imageCID = null;
        let jsonCID = null;
        try {
          imageCID = await uploadFileToPinata(imageDest);
        } catch (e) {
          console.error('Pinata image upload failed:', e);
        }
        try {
          jsonCID = await uploadFileToPinata(jsonDest);
        } catch (e) {
          console.error('Pinata json upload failed:', e);
        }

        resolve({
          success: true,
          edition: nftId,
          rarity: rarityName,
          metadata,
          imageUrl: imageCID ? `ipfs://${imageCID}` : `/nft/images/${nftId}.png`,
          jsonUrl: jsonCID ? `ipfs://${jsonCID}` : `/nft/json/${nftId}.json`,
        });
      } catch (error) {
        console.error("Post-processing error:", error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  });
}
