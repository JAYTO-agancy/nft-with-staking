import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ContractListenerService } from "./services/contractListener";
import { JobManagerService } from "./services/jobManager";
import { GenerationJob } from "./types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Services
let contractListener: ContractListenerService;
let jobManager: JobManagerService;
// Removed PinataService; now using S3 via JobManager

// Initialize services
async function initializeServices() {
  try {
    console.log(
      "🚀 Initializing services..."
    );

    // Initialize services
    contractListener =
      new ContractListenerService();
    jobManager =
      new JobManagerService();

    // Test connections
    console.log(
      "🔍 Testing service connections..."
    );

    const contractConnected =
      await contractListener.testConnection();
    if (!contractConnected) {
      console.warn(
        "⚠️ Contract connection failed, but continuing..."
      );
      // Don't throw error, just warn - server can still work for manual job creation
    }

    // S3 connectivity is validated lazily when uploading

    console.log(
      "✅ All services initialized successfully"
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to initialize services:",
      error
    );
    return false;
  }
}

// Start contract listening
async function startContractListener() {
  console.log(
    "🎧 Starting contract event listener..."
  );

  await contractListener.startListening(
    async (event) => {
      try {
        console.log(
          `🎉 New mint event received for token ${event.tokenId}`
        );

        // Create generation job
        const job =
          jobManager.createJob(event);

        // Process job asynchronously
        processJobAsync(job.id);
      } catch (error) {
        console.error(
          "❌ Error handling contract event:",
          error
        );
      }
    }
  );
}

// Process job asynchronously
async function processJobAsync(
  jobId: string
) {
  try {
    await jobManager.processJob(jobId);
  } catch (error) {
    console.error(
      `❌ Failed to process job ${jobId}:`,
      error
    );
  }
}

// Routes

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get job status by job ID
 */
app.get("/job/:jobId", (req, res) => {
  try {
    const { jobId } = req.params;
    const job =
      jobManager.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    res.json({ job });
  } catch (error) {
    console.error(
      "Error getting job:",
      error
    );
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * Get job status by token ID
 */
app.get(
  "/token/:tokenId",
  (req, res) => {
    try {
      const tokenId = parseInt(
        req.params.tokenId
      );
      if (isNaN(tokenId)) {
        return res.status(400).json({
          error: "Invalid token ID",
        });
      }

      const job =
        jobManager.getJobByTokenId(
          tokenId
        );

      if (!job) {
        return res.status(404).json({
          error:
            "Job not found for this token",
        });
      }

      res.json({ job });
    } catch (error) {
      console.error(
        "Error getting job by token ID:",
        error
      );
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * Get all jobs for a user address
 */
app.get(
  "/user/:address/jobs",
  (req, res) => {
    try {
      const { address } = req.params;
      const jobs =
        jobManager.getUserJobs(address);

      res.json({ jobs });
    } catch (error) {
      console.error(
        "Error getting user jobs:",
        error
      );
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Removed public stats endpoint to keep server minimal

// Removed contract stats endpoint (obtain data directly from contract on frontend)

// Removed NFT statistics endpoint

// Removed contract supply endpoint

/**
 * Manual job creation (for testing)
 */
app.post(
  "/test/create-job",
  async (req, res) => {
    try {
      const {
        tokenId,
        userAddress,
        rarityLevel,
      } = req.body;

      if (!tokenId || !userAddress) {
        return res.status(400).json({
          error:
            "tokenId and userAddress are required",
        });
      }

      const mockEvent = {
        tokenId: parseInt(tokenId),
        to: userAddress,
        from: "0x0000000000000000000000000000000000000000",
        transactionHash:
          "0x" +
          Math.random()
            .toString(16)
            .slice(2),
        blockNumber: Math.floor(
          Math.random() * 1000000
        ),
      };

      const job =
        jobManager.createJob(mockEvent);

      // Process job asynchronously
      processJobAsync(job.id);

      res.json({ job });
    } catch (error) {
      console.error(
        "Error creating test job:",
        error
      );
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Removed past events endpoint

// Cleanup job - run every hour
setInterval(() => {
  if (jobManager) {
    jobManager.cleanupOldJobs();
  }
}, 60 * 60 * 1000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log(
    "\n🛑 Received SIGINT, shutting down gracefully..."
  );

  if (contractListener) {
    contractListener.stopListening();
  }

  process.exit(0);
});

// Start server
async function startServer() {
  try {
    const initialized =
      await initializeServices();

    if (!initialized) {
      console.error(
        "❌ Failed to initialize services, exiting..."
      );
      process.exit(1);
    }

    // Reconcile on startup to avoid missed generations
    await reconcileExistingMints();

    // Start contract listener
    await startContractListener();

    // Start Express server
    app.listen(PORT, () => {
      console.log(
        `🚀 NFT Listener Server running on port ${PORT}`
      );
      console.log(
        `📍 Health check: http://localhost:${PORT}/health`
      );
      console.log(
        `📊 Stats: http://localhost:${PORT}/stats`
      );
    });
  } catch (error) {
    console.error(
      "❌ Failed to start server:",
      error
    );
    process.exit(1);
  }
}
// Reconcile already minted tokens: ensure assets exist in S3
async function reconcileExistingMints() {
  console.log(
    "🔄 Reconciling existing mints with S3..."
  );
  try {
    const mode = (
      process.env.RECONCILE_MODE ||
      "totalsupply"
    ).toLowerCase();
    let tokenIds: number[] = [];

    if (mode === "totalsupply") {
      const totalSupply =
        await contractListener.getTotalSupply();
      if (totalSupply <= 0) {
        console.log(
          "ℹ️ totalSupply is 0, nothing to reconcile"
        );
        return;
      }
      tokenIds = Array.from(
        { length: totalSupply },
        (_, i) => i + 1
      );
    } else {
      // Determine block window for reconciliation
      const hours = parseInt(
        process.env.RECONCILE_HOURS ||
          "168",
        10
      );
      const currentBlock =
        await contractListener.getCurrentBlockNumber();
      const avgBlockTimeSec = parseInt(
        process.env.BLOCK_TIME_SEC ||
          "12",
        10
      );
      const estimatedBlocks = Math.max(
        1,
        Math.floor(
          (hours * 3600) /
            avgBlockTimeSec
        )
      );
      const fromBlock =
        currentBlock -
        BigInt(estimatedBlocks);
      const events =
        await contractListener.getMintEventsInRange(
          fromBlock > 0n
            ? fromBlock
            : 0n,
          currentBlock
        );
      tokenIds = [
        ...new Set(
          events.map((e) => e.tokenId)
        ),
      ];
    }
    if (!tokenIds.length) {
      console.log(
        "ℹ️ No past mints found"
      );
      return;
    }

    // Process sequentially to avoid high load
    for (const tokenId of tokenIds) {
      const existingJob =
        jobManager.getJobByTokenId(
          tokenId
        );
      if (
        existingJob?.status ===
        "completed"
      )
        continue;

      // Lazy create a temp S3Service via jobManager internals
      // We'll ask jobManager to create a job if needed
      // Quick existence check will happen inside processJob pipeline after generation

      // Skip if S3 already has both objects
      // We reuse jobManager's s3Service via a helper call by creating a lightweight service here
      // To keep boundaries, trigger a lightweight check by constructing S3Service
      const { S3Service } =
        await import("./services/s3");
      const s3 = new S3Service();
      const presence =
        await s3.doesTokenAssetsExist(
          tokenId
        );
      if (
        presence.image &&
        presence.metadata
      ) {
        continue;
      }

      let rarity: number | undefined =
        undefined;
      const contractRarity =
        await contractListener.getTokenRarityByMapping(
          tokenId
        );
      if (contractRarity !== null) {
        rarity = contractRarity + 1; // enum 0..4 → levels 1..5
      }
      const job = jobManager.createJob({
        tokenId,
        to: "0x",
        from: "0x",
        transactionHash: "0x",
        blockNumber: 0,
        rarity,
      });
      // Process job asynchronously
      processJobAsync(job.id);
    }

    console.log(
      "✅ Reconciliation done"
    );
  } catch (error) {
    console.error(
      "❌ Reconciliation failed:",
      error
    );
  }
}

// Start the server
startServer();
