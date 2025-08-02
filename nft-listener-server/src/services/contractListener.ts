import { ethers } from "ethers";
import { ContractEvent } from "../types";

// Импортируем ABI из основного приложения
const StakableNFT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
];

export class ContractListenerService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor() {
    const rpcUrl = process.env.RPC_URL!;
    this.contractAddress =
      process.env.CONTRACT_ADDRESS!;

    if (
      !rpcUrl ||
      !this.contractAddress
    ) {
      throw new Error(
        "RPC_URL and CONTRACT_ADDRESS must be configured"
      );
    }

    this.provider =
      new ethers.JsonRpcProvider(
        rpcUrl
      );
    this.contract = new ethers.Contract(
      this.contractAddress,
      StakableNFT_ABI,
      this.provider
    );
  }

  /**
   * Start listening for Transfer events (mints)
   */
  startListening(
    callback: (
      event: ContractEvent
    ) => void
  ): void {
    console.log(
      `🎧 Starting to listen for Transfer events on ${this.contractAddress}...`
    );

    // Listen for Transfer events where from = 0x0 (mint events)
    this.contract.on(
      "Transfer",
      async (
        from,
        to,
        tokenId,
        event
      ) => {
        try {
          // Only process mint events (from = 0x0)
          if (
            from === ethers.ZeroAddress
          ) {
            console.log(
              `🎉 New mint detected!`
            );
            console.log(
              `  Token ID: ${tokenId.toString()}`
            );
            console.log(`  To: ${to}`);
            console.log(
              `  Transaction: ${event.log.transactionHash}`
            );
            console.log(
              `  Block: ${event.log.blockNumber}`
            );

            const contractEvent: ContractEvent =
              {
                tokenId:
                  Number(tokenId),
                to,
                from,
                transactionHash:
                  event.log
                    .transactionHash,
                blockNumber:
                  event.log.blockNumber,
              };

            callback(contractEvent);
          }
        } catch (error) {
          console.error(
            "❌ Error processing Transfer event:",
            error
          );
        }
      }
    );

    // Handle connection errors
    this.provider.on(
      "error",
      (error) => {
        console.error(
          "❌ Provider error:",
          error
        );
      }
    );

    console.log(
      "✅ Contract listener started successfully"
    );
  }

  /**
   * Stop listening for events
   */
  stopListening(): void {
    console.log(
      "🛑 Stopping contract listener..."
    );
    this.contract.removeAllListeners(
      "Transfer"
    );
    this.provider.removeAllListeners(
      "error"
    );
    console.log(
      "✅ Contract listener stopped"
    );
  }

  /**
   * Get token owner
   */
  async getTokenOwner(
    tokenId: number
  ): Promise<string> {
    try {
      return await this.contract.ownerOf(
        tokenId
      );
    } catch (error) {
      throw new Error(
        `Failed to get owner of token ${tokenId}: ${error}`
      );
    }
  }

  /**
   * Get current token URI
   */
  async getTokenURI(
    tokenId: number
  ): Promise<string> {
    try {
      return await this.contract.tokenURI(
        tokenId
      );
    } catch (error) {
      throw new Error(
        `Failed to get URI of token ${tokenId}: ${error}`
      );
    }
  }

  /**
   * Get total supply
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply =
        await this.contract.totalSupply();
      return Number(supply);
    } catch (error) {
      throw new Error(
        `Failed to get total supply: ${error}`
      );
    }
  }

  /**
   * Test contract connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log(
        "🔍 Testing contract connection..."
      );

      // Try to get total supply as a test
      const totalSupply =
        await this.getTotalSupply();
      console.log(
        `✅ Contract connection successful. Total supply: ${totalSupply}`
      );

      return true;
    } catch (error) {
      console.error(
        "❌ Contract connection failed:",
        error
      );
      return false;
    }
  }

  /**
   * Get past mint events (useful for catching up on missed events)
   */
  async getPastMintEvents(
    fromBlock?: number
  ): Promise<ContractEvent[]> {
    try {
      console.log(
        "📜 Fetching past mint events..."
      );

      const filter =
        this.contract.filters.Transfer(
          ethers.ZeroAddress,
          null,
          null
        );
      const events =
        await this.contract.queryFilter(
          filter,
          fromBlock
        );

      const contractEvents: ContractEvent[] =
        events.map((event) => {
          // Type guard to check if this is an EventLog with args
          if (
            "args" in event &&
            event.args
          ) {
            return {
              tokenId: Number(
                event.args.tokenId
              ),
              to: event.args.to,
              from: event.args.from,
              transactionHash:
                event.transactionHash,
              blockNumber:
                event.blockNumber,
            };
          }
          // Fallback for Log type (shouldn't happen with our filter but just in case)
          throw new Error(
            "Unexpected log format without args"
          );
        });

      console.log(
        `✅ Found ${contractEvents.length} past mint events`
      );
      return contractEvents;
    } catch (error) {
      console.error(
        "❌ Error fetching past events:",
        error
      );
      throw new Error(
        `Failed to fetch past events: ${error}`
      );
    }
  }
}
