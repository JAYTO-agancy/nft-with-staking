import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ContractListenerService } from "./services/contractListener";
import { JobManagerService } from "./services/jobManager";
import { PinataService } from "./services/pinata";
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
let pinataService: PinataService;

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
    pinataService = new PinataService();

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

    const pinataConnected =
      await pinataService.testAuthentication();
    if (!pinataConnected) {
      throw new Error(
        "Failed to authenticate with Pinata"
      );
    }

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
    stats:
      jobManager?.getStats() || null,
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

/**
 * Get generation statistics
 */
app.get("/stats", (req, res) => {
  try {
    const stats = jobManager.getStats();
    res.json({ stats });
  } catch (error) {
    console.error(
      "Error getting stats:",
      error
    );
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * Get contract statistics
 */
app.get(
  "/contract/stats",
  async (req, res) => {
    try {
      const contractStats =
        await contractListener.getContractStats();
      res.json({ contractStats });
    } catch (error) {
      console.error(
        "Error getting contract stats:",
        error
      );
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * Get NFT statistics (rarity distribution, recent mints, etc.)
 */
app.get(
  "/nft/statistics",
  async (req, res) => {
    try {
      const statistics =
        contractListener.getStatistics();

      if (!statistics) {
        return res.status(404).json({
          error:
            "Statistics not available yet",
        });
      }

      res.json({ statistics });
    } catch (error) {
      console.error(
        "Error getting NFT statistics:",
        error
      );
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * Get total supply
 */
app.get(
  "/contract/supply",
  async (req, res) => {
    try {
      const totalSupply =
        await contractListener.getTotalSupply();
      res.json({ totalSupply });
    } catch (error) {
      console.error(
        "Error getting total supply:",
        error
      );
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

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

/**
 * Get past NFTMinted events (for catching up)
 */
app.get(
  "/events/past",
  async (req, res) => {
    try {
      const fromBlock = req.query
        .fromBlock
        ? parseInt(
            req.query
              .fromBlock as string
          )
        : undefined;
      const events =
        await contractListener.getPastMintEvents(
          fromBlock
        );

      res.json({ events });
    } catch (error) {
      console.error(
        "Error getting past events:",
        error
      );
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

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

// Start the server
startServer();
