import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import {
  NFTMetadata,
  RarityName,
  RARITY_NAMES,
} from "../types";

const execAsync = promisify(exec);

export class NFTGeneratorService {
  private readonly generatorPath: string;

  constructor() {
    this.generatorPath =
      process.env.NFT_GENERATOR_PATH ||
      "../nft-generator-hashlips";
  }

  /**
   * Generate NFT with specific rarity
   */
  async generateNFT(
    rarityName: RarityName,
    tokenId: number
  ): Promise<{
    imagePath: string;
    metadata: NFTMetadata;
  }> {
    try {
      console.log(
        `🎨 Generating ${rarityName} NFT for token ${tokenId}...`
      );

      // Очищаем предыдущие результаты
      await this.cleanupBuildDirectory();

      // Запускаем генерацию через Node.js скрипт
      const command = `cd ${this.generatorPath} && node -e "
        const { startCreating, buildSetup } = require('./src/main.js');
        
        async function generate() {
          try {
            buildSetup();
            await startCreating('${rarityName}', 1);
            console.log('Generation completed successfully');
            process.exit(0);
          } catch (error) {
            console.error('Generation failed:', error);
            process.exit(1);
          }
        }
        
        generate();
      "`;

      console.log(
        "🚀 Starting NFT generation..."
      );
      const { stdout, stderr } =
        await execAsync(command, {
          timeout: 30000, // 30 секунд timeout
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        });

      if (stderr) {
        console.warn(
          "Generation warnings:",
          stderr
        );
      }

      console.log(
        "Generation output:",
        stdout
      );

      // Проверяем результаты генерации
      const buildPath = path.join(
        this.generatorPath,
        "build"
      );
      const imagePath = path.join(
        buildPath,
        "images",
        "1.png"
      );
      const metadataPath = path.join(
        buildPath,
        "json",
        "1.json"
      );

      // Проверяем что файлы созданы
      await this.verifyFileExists(
        imagePath
      );
      await this.verifyFileExists(
        metadataPath
      );

      // Читаем метаданные
      const metadataContent =
        await fs.readFile(
          metadataPath,
          "utf-8"
        );
      const metadata: NFTMetadata =
        JSON.parse(metadataContent);

      // Обновляем метаданные для нашего tokenId
      metadata.name = `Plumffel NFT #${tokenId}`;
      metadata.edition = tokenId;

      console.log(
        `✅ NFT generated successfully: ${rarityName}`
      );

      return {
        imagePath,
        metadata,
      };
    } catch (error) {
      console.error(
        "❌ Error generating NFT:",
        error
      );
      throw new Error(
        `Failed to generate NFT: ${error}`
      );
    }
  }

  /**
   * Get rarity by level
   */
  getRarityName(
    level: number
  ): RarityName {
    if (level < 1 || level > 5) {
      throw new Error(
        `Invalid rarity level: ${level}`
      );
    }
    return RARITY_NAMES[
      level as keyof typeof RARITY_NAMES
    ];
  }

  /**
   * Clean build directory before generation
   */
  private async cleanupBuildDirectory(): Promise<void> {
    try {
      const buildPath = path.join(
        this.generatorPath,
        "build"
      );

      // Проверяем существует ли директория
      try {
        await fs.access(buildPath);
        // Если существует, удаляем содержимое
        await fs.rm(buildPath, {
          recursive: true,
          force: true,
        });
        console.log(
          "🧹 Build directory cleaned"
        );
      } catch {
        // Директория не существует, это нормально
        console.log(
          "📁 Build directory does not exist, will be created"
        );
      }
    } catch (error) {
      console.warn(
        "⚠️ Warning: Could not clean build directory:",
        error
      );
    }
  }

  /**
   * Verify file exists and is readable
   */
  private async verifyFileExists(
    filePath: string
  ): Promise<void> {
    try {
      const stats = await fs.stat(
        filePath
      );
      if (!stats.isFile()) {
        throw new Error(
          `Path is not a file: ${filePath}`
        );
      }
      if (stats.size === 0) {
        throw new Error(
          `File is empty: ${filePath}`
        );
      }
      console.log(
        `✅ File verified: ${filePath} (${stats.size} bytes)`
      );
    } catch (error) {
      throw new Error(
        `File verification failed: ${filePath} - ${error}`
      );
    }
  }

  /**
   * Copy generated files to a safe location with tokenId
   */
  async copyGeneratedFiles(
    tokenId: number
  ): Promise<{
    imagePath: string;
    metadataPath: string;
  }> {
    try {
      const buildPath = path.join(
        this.generatorPath,
        "build"
      );
      const outputDir = path.join(
        process.cwd(),
        "generated",
        tokenId.toString()
      );

      // Создаем выходную директорию
      await fs.mkdir(outputDir, {
        recursive: true,
      });

      const sourceImagePath = path.join(
        buildPath,
        "images",
        "1.png"
      );
      const sourceMetadataPath =
        path.join(
          buildPath,
          "json",
          "1.json"
        );

      const targetImagePath = path.join(
        outputDir,
        `${tokenId}.png`
      );
      const targetMetadataPath =
        path.join(
          outputDir,
          `${tokenId}.json`
        );

      // Копируем файлы
      await fs.copyFile(
        sourceImagePath,
        targetImagePath
      );
      await fs.copyFile(
        sourceMetadataPath,
        targetMetadataPath
      );

      console.log(
        `📋 Files copied to: ${outputDir}`
      );

      return {
        imagePath: targetImagePath,
        metadataPath:
          targetMetadataPath,
      };
    } catch (error) {
      throw new Error(
        `Failed to copy generated files: ${error}`
      );
    }
  }
}
