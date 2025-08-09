import {
  GenerationJob,
  ContractEvent,
  RarityLevel,
} from "../types";
import { NFTGeneratorService } from "./nftGenerator";
import { S3Service } from "./s3";
import { v4 as uuidv4 } from "uuid";

export class JobManagerService {
  private jobs: Map<
    string,
    GenerationJob
  > = new Map();
  private nftGenerator: NFTGeneratorService;
  private s3Service: S3Service;

  constructor() {
    this.nftGenerator =
      new NFTGeneratorService();
    this.s3Service = new S3Service();
  }

  /**
   * Create a new generation job
   */
  createJob(
    event: ContractEvent
  ): GenerationJob {
    const job: GenerationJob = {
      id: uuidv4(),
      tokenId: event.tokenId,
      userAddress: event.to,
      rarityLevel:
        event.rarity &&
        event.rarity >= 1 &&
        event.rarity <= 5
          ? (event.rarity as RarityLevel)
          : this.determineRarity(
              event.tokenId
            ),
      status: "pending",
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    console.log(
      `📝 Created generation job ${
        job.id
      } for token ${
        job.tokenId
      } (${this.nftGenerator.getRarityName(
        job.rarityLevel
      )})`
    );

    return job;
  }

  /**
   * Process a generation job
   */
  async processJob(
    jobId: string
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(
        `Job ${jobId} not found`
      );
    }

    try {
      console.log(
        `🚀 Processing job ${jobId} for token ${job.tokenId}...`
      );

      // Update status to generating
      this.updateJobStatus(
        jobId,
        "generating"
      );

      // Generate NFT
      const rarityName =
        this.nftGenerator.getRarityName(
          job.rarityLevel
        );
      const { imagePath, metadata } =
        await this.nftGenerator.generateNFT(
          rarityName,
          job.tokenId
        );

      // Update status to uploading
      this.updateJobStatus(
        jobId,
        "uploading"
      );

      // Upload to S3
      const imageUrl =
        await this.s3Service.uploadImage(
          imagePath,
          job.tokenId
        );

      // Update metadata with image URL
      metadata.image = imageUrl;

      const metadataUrl =
        await this.s3Service.uploadMetadata(
          metadata,
          job.tokenId
        );

      // Update job with results
      job.imageUrl = imageUrl;
      job.metadataUrl = metadataUrl;
      job.completedAt = new Date();

      this.updateJobStatus(
        jobId,
        "completed"
      );

      console.log(
        `✅ Job ${jobId} completed successfully`
      );
      console.log(
        `  Image: ${imageUrl}`
      );
      console.log(
        `  Metadata: ${metadataUrl}`
      );

      // Cleanup generated files
      await this.cleanupGeneratedFiles(
        job.tokenId
      );
    } catch (error) {
      console.error(
        `❌ Job ${jobId} failed:`,
        error
      );
      job.error =
        error instanceof Error
          ? error.message
          : String(error);
      this.updateJobStatus(
        jobId,
        "failed"
      );
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  getJob(
    jobId: string
  ): GenerationJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get job by token ID
   */
  getJobByTokenId(
    tokenId: number
  ): GenerationJob | undefined {
    for (const job of this.jobs.values()) {
      if (job.tokenId === tokenId) {
        return job;
      }
    }
    return undefined;
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(
    userAddress: string
  ): GenerationJob[] {
    return Array.from(
      this.jobs.values()
    ).filter(
      (job) =>
        job.userAddress.toLowerCase() ===
        userAddress.toLowerCase()
    );
  }

  /**
   * Update job status
   */
  private updateJobStatus(
    jobId: string,
    status: GenerationJob["status"]
  ): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = status;
      console.log(
        `📊 Job ${jobId} status updated: ${status}`
      );
    }
  }

  /**
   * Determine rarity based on token ID
   * This is a simple implementation - you might want to make it more sophisticated
   */
  private determineRarity(
    tokenId: number
  ): RarityLevel {
    // Simple rarity determination based on probability
    // You can implement more complex logic here
    const random = Math.random();

    if (random < 0.5) return 1; // 50% Common
    if (random < 0.75) return 2; // 25% Uncommon
    if (random < 0.9) return 3; // 15% Rare
    if (random < 0.98) return 4; // 8% Epic
    return 5; // 2% Legendary
  }

  /**
   * Clean up generated files after upload
   */
  private async cleanupGeneratedFiles(
    tokenId: number
  ): Promise<void> {
    try {
      // Implementation depends on your file storage strategy
      console.log(
        `🧹 Cleaning up generated files for token ${tokenId}`
      );
      // You might want to keep files for a while or move them to archive
    } catch (error) {
      console.warn(
        `⚠️ Failed to cleanup files for token ${tokenId}:`,
        error
      );
    }
  }

  /**
   * Get jobs statistics
   */
  getStats(): {
    total: number;
    pending: number;
    generating: number;
    uploading: number;
    completed: number;
    failed: number;
  } {
    const jobs = Array.from(
      this.jobs.values()
    );

    return {
      total: jobs.length,
      pending: jobs.filter(
        (j) => j.status === "pending"
      ).length,
      generating: jobs.filter(
        (j) => j.status === "generating"
      ).length,
      uploading: jobs.filter(
        (j) => j.status === "uploading"
      ).length,
      completed: jobs.filter(
        (j) => j.status === "completed"
      ).length,
      failed: jobs.filter(
        (j) => j.status === "failed"
      ).length,
    };
  }

  /**
   * Clean up old jobs (call periodically)
   */
  cleanupOldJobs(
    maxAge: number = 24 * 60 * 60 * 1000
  ): void {
    const now = new Date();
    const cutoff = new Date(
      now.getTime() - maxAge
    );

    let cleaned = 0;
    for (const [
      jobId,
      job,
    ] of this.jobs.entries()) {
      if (
        job.createdAt < cutoff &&
        (job.status === "completed" ||
          job.status === "failed")
      ) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(
        `🧹 Cleaned up ${cleaned} old jobs`
      );
    }
  }
}
