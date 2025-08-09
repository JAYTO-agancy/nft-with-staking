import {
  createPublicClient,
  http,
  parseAbi,
  type PublicClient,
  type Address,
  zeroAddress,
  type Log,
  createWalletClient,
  type WalletClient,
} from "viem";
import { sepolia } from "viem/chains";
import {
  ContractEvent,
  NFTStatistics,
} from "../types";
import {
  ContractStats,
  NFTMintEvent,
  StakableNFTAbi,
  RarityStats,
} from "../../shared/abis";

// Используем только нужные функции для прослушки событий
const NFT_ABI = parseAbi([
  // Events
  "event NFTMinted(address indexed to, uint256 indexed tokenId, uint8 rarity)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event CommitSubmitted(address indexed user, bytes32 commitHash, uint256 timestamp)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",

  // View functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function getTokenRarity(uint256 tokenId) view returns (uint8)",
  "function getTokenMultiplier(uint256 tokenId) view returns (uint256)",
  "function getRarityRemainingSupply(uint8 rarity) view returns (uint256)",
  "function rarityMintedCount(uint8 rarity) view returns (uint256)",
  "function raritySupplyLimits(uint8 rarity) view returns (uint256)",
  "function rarityMultipliers(uint8 rarity) view returns (uint256)",
  "function getContractOwner() view returns (address)",
  "function owner() view returns (address)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function tokenRarity(uint256 tokenId) view returns (uint8)",
  "function commits(address user) view returns (bytes32)",
  "function commitTimestamps(address user) view returns (uint256)",
  "function COMMIT_DELAY() view returns (uint256)",
  "function COMMIT_EXPIRY() view returns (uint256)",
]);

// Логируем информацию о загруженном ABI
console.log(
  `📋 Loaded StakableNFTAbi with ${StakableNFTAbi.length} items`
);
console.log(
  `🔧 Functions: ${
    StakableNFTAbi.filter(
      (item: any) =>
        item.type === "function"
    ).length
  }`
);
console.log(
  `📡 Events: ${
    StakableNFTAbi.filter(
      (item: any) =>
        item.type === "event"
    ).length
  }`
);

export class ContractListenerService {
  private client: PublicClient;
  private contractAddress: Address;
  private isListening = false;
  private pollingInterval: NodeJS.Timeout | null =
    null;
  private lastProcessedBlock = 0;
  private statistics: NFTStatistics | null =
    null;
  private rarityNames = [
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];

  constructor() {
    this.contractAddress = process.env
      .CONTRACT_ADDRESS! as Address;

    if (!this.contractAddress) {
      throw new Error(
        "CONTRACT_ADDRESS must be configured"
      );
    }

    // Используем встроенный RPC URL из sepolia или пользовательский
    const rpcUrl =
      process.env.RPC_URL ||
      sepolia.rpcUrls.default.http[0];

    console.log(
      `🔗 Using RPC URL: ${rpcUrl}`
    );

    // Создаем клиент
    this.client = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl),
    });
  }

  /**
   * Start listening for NFTMinted events (actual NFT minting)
   * Uses polling to check for new events every 10 seconds
   */
  async startListening(
    callback: (
      event: ContractEvent
    ) => void
  ): Promise<void> {
    if (this.isListening) {
      console.log(
        "⚠️ Already listening for events"
      );
      return;
    }

    console.log(
      `🎧 Starting to listen for NFTMinted events on ${this.contractAddress}...`
    );

    // Initialize statistics on startup
    await this.initializeStatistics();

    this.isListening = true;

    // Start polling for events every 10 seconds
    this.pollingInterval = setInterval(
      async () => {
        try {
          await this.checkForNewEvents(
            callback
          );
        } catch (error) {
          console.error(
            "❌ Error checking for new events:",
            error
          );
        }
      },
      10000
    ); // 10 seconds

    console.log(
      "✅ Contract listener started (polling mode)"
    );
    console.log(
      "📝 Polling for NFTMinted events every 10 seconds"
    );
  }

  /**
   * Stop listening for events
   */
  stopListening(): void {
    console.log(
      "🛑 Stopping contract listener..."
    );

    if (this.pollingInterval) {
      clearInterval(
        this.pollingInterval
      );
      this.pollingInterval = null;
    }

    this.isListening = false;
    console.log(
      "✅ Contract listener stopped"
    );
  }

  /**
   * Initialize statistics by collecting all existing NFTMinted events
   */
  private async initializeStatistics(): Promise<void> {
    try {
      console.log(
        "📊 Initializing NFT statistics..."
      );

      // Get all NFTMinted events from the beginning
      const currentBlock =
        await this.client.getBlockNumber();
      const fromBlock = BigInt(0); // Start from genesis block

      const logs =
        await this.client.getLogs({
          address: this.contractAddress,
          event: {
            type: "event",
            name: "NFTMinted",
            inputs: [
              {
                type: "address",
                name: "to",
                indexed: true,
              },
              {
                type: "uint256",
                name: "tokenId",
                indexed: true,
              },
              {
                type: "uint8",
                name: "rarity",
                indexed: false,
              },
            ],
          },
          fromBlock,
          toBlock: currentBlock,
        });

      // Process all events to build statistics
      const events: ContractEvent[] =
        logs.map((log) => ({
          tokenId: Number(
            log.args.tokenId
          ),
          to:
            log.args.to || zeroAddress,
          from: zeroAddress,
          transactionHash:
            log.transactionHash,
          blockNumber: Number(
            log.blockNumber
          ),
          rarity: Number(
            log.args.rarity
          ),
        }));

      // Build rarity distribution
      const rarityDistribution: {
        [rarity: number]: {
          name: string;
          count: number;
          percentage: number;
        };
      } = {};

      for (
        let rarity = 0;
        rarity < 5;
        rarity++
      ) {
        const count = events.filter(
          (e) => e.rarity === rarity
        ).length;
        rarityDistribution[rarity] = {
          name:
            this.rarityNames[rarity] ||
            `Rarity ${rarity}`,
          count,
          percentage:
            events.length > 0
              ? (count /
                  events.length) *
                100
              : 0,
        };
      }

      this.statistics = {
        totalMinted: events.length,
        rarityDistribution,
        recentMints: events.slice(-10), // Keep last 10 mints
        lastUpdated: Date.now(),
      };

      this.lastProcessedBlock = Number(
        currentBlock
      );

      console.log(
        `✅ Statistics initialized: ${events.length} total NFTs minted`
      );
      console.log(
        "📊 Rarity distribution:",
        rarityDistribution
      );
    } catch (error) {
      console.error(
        "❌ Error initializing statistics:",
        error
      );
      // Initialize with empty statistics
      this.statistics = {
        totalMinted: 0,
        rarityDistribution: {},
        recentMints: [],
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * Update statistics with new event
   */
  private updateStatistics(
    event: ContractEvent
  ): void {
    if (!this.statistics) return;

    // Update total count
    this.statistics.totalMinted++;

    // Update rarity distribution
    const rarity = event.rarity || 0;
    if (
      !this.statistics
        .rarityDistribution[rarity]
    ) {
      this.statistics.rarityDistribution[
        rarity
      ] = {
        name:
          this.rarityNames[rarity] ||
          `Rarity ${rarity}`,
        count: 0,
        percentage: 0,
      };
    }

    this.statistics.rarityDistribution[
      rarity
    ].count++;

    // Recalculate percentages
    Object.keys(
      this.statistics.rarityDistribution
    ).forEach((rarityKey) => {
      const rarityNum =
        parseInt(rarityKey);
      if (this.statistics) {
        this.statistics.rarityDistribution[
          rarityNum
        ].percentage =
          (this.statistics
            .rarityDistribution[
            rarityNum
          ].count /
            this.statistics
              .totalMinted) *
          100;
      }
    });

    // Update recent mints
    this.statistics.recentMints.push(
      event
    );
    if (
      this.statistics.recentMints
        .length > 10
    ) {
      this.statistics.recentMints.shift(); // Remove oldest
    }

    this.statistics.lastUpdated =
      Date.now();

    console.log(
      `📊 Statistics updated: Total ${this.statistics.totalMinted}, Rarity ${rarity}: ${this.statistics.rarityDistribution[rarity].count}`
    );
  }

  /**
   * Get current statistics
   */
  getStatistics(): NFTStatistics | null {
    return this.statistics;
  }

  /**
   * Check for new NFTMinted events
   */
  private async checkForNewEvents(
    callback: (
      event: ContractEvent
    ) => void
  ): Promise<void> {
    try {
      // Get current block number
      const currentBlock =
        await this.client.getBlockNumber();

      if (
        this.lastProcessedBlock === 0
      ) {
        // First time, start from current block
        this.lastProcessedBlock =
          Number(currentBlock);
        console.log(
          `📊 Starting to monitor from block ${this.lastProcessedBlock}`
        );
        return;
      }

      const fromBlock = BigInt(
        this.lastProcessedBlock + 1
      );
      const toBlock = currentBlock;

      if (fromBlock > toBlock) {
        return; // No new blocks
      }

      console.log(
        `🔍 Checking for events from block ${fromBlock} to ${toBlock}`
      );

      // Get NFTMinted events
      const logs =
        await this.client.getLogs({
          address: this.contractAddress,
          event: {
            type: "event",
            name: "NFTMinted",
            inputs: [
              {
                type: "address",
                name: "to",
                indexed: true,
              },
              {
                type: "uint256",
                name: "tokenId",
                indexed: true,
              },
              {
                type: "uint8",
                name: "rarity",
                indexed: false,
              },
            ],
          },
          fromBlock,
          toBlock,
        });

      for (const log of logs) {
        try {
          const event: ContractEvent = {
            tokenId: Number(
              log.args.tokenId
            ),
            to:
              log.args.to ||
              zeroAddress,
            from: zeroAddress, // NFTMinted events don't have 'from'
            transactionHash:
              log.transactionHash,
            blockNumber: Number(
              log.blockNumber
            ),
            rarity: Number(
              log.args.rarity
            ),
          };

          console.log(
            `🎉 New NFTMinted event: Token ${event.tokenId} to ${event.to} (Rarity: ${event.rarity})`
          );

          // Update statistics with new event
          this.updateStatistics(event);

          // Call the callback
          callback(event);
        } catch (error) {
          console.error(
            "❌ Error processing event:",
            error
          );
        }
      }

      this.lastProcessedBlock =
        Number(toBlock);
    } catch (error) {
      console.error(
        "❌ Error checking for new events:",
        error
      );
    }
  }

  /**
   * Get token owner
   */
  async getTokenOwner(
    tokenId: number
  ): Promise<string> {
    try {
      console.log(
        `🔍 Getting owner of token ${tokenId}...`
      );

      const owner =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "ownerOf",
            args: [BigInt(tokenId)],
          }
        )) as string;

      console.log(
        `✅ Token ${tokenId} owner: ${owner}`
      );
      return owner;
    } catch (error) {
      console.error(
        `❌ Failed to get owner of token ${tokenId}:`,
        error
      );
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
      console.log(
        `🔍 Getting URI of token ${tokenId}...`
      );

      const uri =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "tokenURI",
            args: [BigInt(tokenId)],
          }
        )) as string;

      console.log(
        `✅ Token ${tokenId} URI: ${uri}`
      );
      return uri;
    } catch (error) {
      console.error(
        `❌ Failed to get URI of token ${tokenId}:`,
        error
      );
      throw new Error(
        `Failed to get URI of token ${tokenId}: ${error}`
      );
    }
  }

  /**
   * Get total supply from contract
   */
  async getTotalSupply(): Promise<number> {
    try {
      console.log(
        "🔍 Getting total supply from contract..."
      );

      const totalSupply =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "totalSupply",
          }
        )) as bigint;

      const supply = Number(
        totalSupply
      );
      console.log(
        `✅ Total supply: ${supply}`
      );
      return supply;
    } catch (error) {
      console.error(
        "❌ Failed to get total supply:",
        error
      );
      return 0;
    }
  }

  /**
   * Get max supply from contract
   */
  async getMaxSupply(): Promise<number> {
    try {
      console.log(
        "🔍 Getting max supply from contract..."
      );

      const maxSupply =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "MAX_SUPPLY",
          }
        )) as bigint;

      const supply = Number(maxSupply);
      console.log(
        `✅ Max supply: ${supply}`
      );
      return supply;
    } catch (error) {
      console.error(
        "❌ Failed to get max supply:",
        error
      );
      return 0;
    }
  }

  /**
   * Get mint price from contract
   */
  async getMintPrice(): Promise<number> {
    try {
      console.log(
        "🔍 Getting mint price from contract..."
      );

      const mintPrice =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "mintPrice",
          }
        )) as bigint;

      const price = Number(mintPrice);
      console.log(
        `✅ Mint price: ${price} wei`
      );
      return price;
    } catch (error) {
      console.error(
        "❌ Failed to get mint price:",
        error
      );
      return 0;
    }
  }

  /**
   * Get token rarity
   */
  async getTokenRarity(
    tokenId: number
  ): Promise<number> {
    try {
      console.log(
        `🔍 Getting rarity for token ${tokenId}...`
      );

      const rarity =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName:
              "getTokenRarity",
            args: [BigInt(tokenId)],
          }
        )) as number;

      console.log(
        `✅ Token ${tokenId} rarity: ${rarity}`
      );
      return rarity;
    } catch (error) {
      console.error(
        `❌ Failed to get rarity for token ${tokenId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Get rarity statistics
   */
  async getRarityStats(): Promise<
    RarityStats[]
  > {
    try {
      console.log(
        "🔍 Getting rarity statistics..."
      );

      const rarityStats: RarityStats[] =
        [];
      const rarityNames = [
        "Common",
        "Uncommon",
        "Rare",
        "Epic",
        "Legendary",
      ];

      for (
        let rarity = 0;
        rarity < 5;
        rarity++
      ) {
        try {
          const minted =
            (await this.client.readContract(
              {
                address:
                  this.contractAddress,
                abi: NFT_ABI,
                functionName:
                  "rarityMintedCount",
                args: [rarity],
              }
            )) as bigint;

          const maxSupply =
            (await this.client.readContract(
              {
                address:
                  this.contractAddress,
                abi: NFT_ABI,
                functionName:
                  "raritySupplyLimits",
                args: [rarity],
              }
            )) as bigint;

          const multiplier =
            (await this.client.readContract(
              {
                address:
                  this.contractAddress,
                abi: NFT_ABI,
                functionName:
                  "rarityMultipliers",
                args: [rarity],
              }
            )) as bigint;

          rarityStats.push({
            rarity,
            name:
              rarityNames[rarity] ||
              `Rarity ${rarity}`,
            minted: Number(minted),
            maxSupply:
              Number(maxSupply),
            multiplier:
              Number(multiplier),
            remaining:
              Number(maxSupply) -
              Number(minted),
          });
        } catch (error) {
          console.error(
            `❌ Failed to get stats for rarity ${rarity}:`,
            error
          );
        }
      }

      console.log(
        `✅ Rarity stats: ${JSON.stringify(
          rarityStats,
          null,
          2
        )}`
      );
      return rarityStats;
    } catch (error) {
      console.error(
        "❌ Failed to get rarity stats:",
        error
      );
      return [];
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ContractStats> {
    try {
      console.log(
        "📊 Getting contract statistics..."
      );

      const totalSupply =
        await this.getTotalSupply();
      const maxSupply =
        await this.getMaxSupply();
      const mintPrice =
        await this.getMintPrice();

      // Получаем статистику по редкостям
      const rarityStats =
        await this.getRarityStats();

      const stats: ContractStats = {
        totalSupply,
        totalMinted: totalSupply,
        lastMintBlock: undefined,
        lastMintTimestamp: undefined,
        maxSupply,
        mintPrice,
        rarityStats,
      };

      console.log(
        `✅ Contract stats: ${JSON.stringify(
          stats,
          null,
          2
        )}`
      );
      return stats;
    } catch (error) {
      console.error(
        "❌ Failed to get contract stats:",
        error
      );
      return {
        totalSupply: 0,
        totalMinted: 0,
      };
    }
  }

  /**
   * Get all NFTMinted events
   */
  async getAllMintEvents(): Promise<
    NFTMintEvent[]
  > {
    try {
      console.log(
        "📜 Getting all NFTMinted events..."
      );

      // Get events from the last 1000 blocks (adjust as needed)
      const currentBlock =
        await this.client.getBlockNumber();
      const fromBlock =
        currentBlock - BigInt(1000);

      const logs =
        await this.client.getLogs({
          address: this.contractAddress,
          event: {
            type: "event",
            name: "NFTMinted",
            inputs: [
              {
                type: "address",
                name: "to",
                indexed: true,
              },
              {
                type: "uint256",
                name: "tokenId",
                indexed: true,
              },
              {
                type: "uint8",
                name: "rarity",
                indexed: false,
              },
            ],
          },
          fromBlock,
          toBlock: currentBlock,
        });

      const events: NFTMintEvent[] =
        logs.map((log) => ({
          tokenId: Number(
            log.args.tokenId
          ),
          to:
            log.args.to || zeroAddress,
          from: zeroAddress,
          transactionHash:
            log.transactionHash,
          blockNumber: Number(
            log.blockNumber
          ),
          timestamp: undefined, // Would need to get from block
        }));

      console.log(
        `✅ Found ${events.length} NFTMinted events`
      );
      return events;
    } catch (error) {
      console.error(
        "❌ Failed to get NFTMinted events:",
        error
      );
      return [];
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

      // Пробуем получить базовую информацию о контракте
      const name =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "name",
          }
        )) as string;

      const symbol =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "symbol",
          }
        )) as string;

      console.log(
        `✅ Contract connection test passed: ${name} (${symbol})`
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
   * Get contract name
   */
  async getContractName(): Promise<string> {
    try {
      const name =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "name",
          }
        )) as string;
      return name;
    } catch (error) {
      console.error(
        "❌ Failed to get contract name:",
        error
      );
      return "Unknown";
    }
  }

  /**
   * Get contract symbol
   */
  async getContractSymbol(): Promise<string> {
    try {
      const symbol =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "symbol",
          }
        )) as string;
      return symbol;
    } catch (error) {
      console.error(
        "❌ Failed to get contract symbol:",
        error
      );
      return "UNKNOWN";
    }
  }

  /**
   * Get user balance
   */
  async getUserBalance(
    userAddress: string
  ): Promise<number> {
    try {
      console.log(
        `🔍 Getting balance for ${userAddress}...`
      );

      const balance =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName: "balanceOf",
            args: [
              userAddress as Address,
            ],
          }
        )) as bigint;

      const userBalance =
        Number(balance);
      console.log(
        `✅ User balance: ${userBalance}`
      );
      return userBalance;
    } catch (error) {
      console.error(
        `❌ Failed to get balance for ${userAddress}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Get token multiplier
   */
  async getTokenMultiplier(
    tokenId: number
  ): Promise<number> {
    try {
      console.log(
        `🔍 Getting multiplier for token ${tokenId}...`
      );

      const multiplier =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi: NFT_ABI,
            functionName:
              "getTokenMultiplier",
            args: [BigInt(tokenId)],
          }
        )) as bigint;

      const tokenMultiplier =
        Number(multiplier);
      console.log(
        `✅ Token ${tokenId} multiplier: ${tokenMultiplier}`
      );
      return tokenMultiplier;
    } catch (error) {
      console.error(
        `❌ Failed to get multiplier for token ${tokenId}:`,
        error
      );
      return 1;
    }
  }

  /**
   * Get block timestamp
   */
  async getBlockTimestamp(
    blockNumber: number
  ): Promise<number> {
    try {
      const block =
        await this.client.getBlock({
          blockNumber: BigInt(
            blockNumber
          ),
        });
      return Number(block.timestamp);
    } catch (error) {
      console.error(
        `❌ Failed to get timestamp for block ${blockNumber}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Get user's tokens
   */
  async getUserTokens(
    userAddress: string
  ): Promise<number[]> {
    try {
      console.log(
        `🔍 Getting tokens for user ${userAddress}...`
      );

      const balance =
        await this.getUserBalance(
          userAddress
        );
      const tokens: number[] = [];

      for (
        let i = 0;
        i < balance;
        i++
      ) {
        try {
          const tokenId =
            (await this.client.readContract(
              {
                address:
                  this.contractAddress,
                abi: NFT_ABI,
                functionName:
                  "tokenOfOwnerByIndex",
                args: [
                  userAddress as Address,
                  BigInt(i),
                ],
              }
            )) as bigint;

          tokens.push(Number(tokenId));
        } catch (error) {
          console.error(
            `❌ Failed to get token ${i} for user ${userAddress}:`,
            error
          );
        }
      }

      console.log(
        `✅ User ${userAddress} has ${
          tokens.length
        } tokens: [${tokens.join(
          ", "
        )}]`
      );
      return tokens;
    } catch (error) {
      console.error(
        `❌ Failed to get tokens for user ${userAddress}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get token details (owner, rarity, multiplier, URI)
   */
  async getTokenDetails(
    tokenId: number
  ): Promise<{
    owner: string;
    rarity: number;
    multiplier: number;
    uri: string;
  }> {
    try {
      console.log(
        `🔍 Getting details for token ${tokenId}...`
      );

      const [
        owner,
        rarity,
        multiplier,
        uri,
      ] = await Promise.all([
        this.getTokenOwner(tokenId),
        this.getTokenRarity(tokenId),
        this.getTokenMultiplier(
          tokenId
        ),
        this.getTokenURI(tokenId),
      ]);

      const details = {
        owner,
        rarity,
        multiplier,
        uri,
      };

      console.log(
        `✅ Token ${tokenId} details:`,
        details
      );
      return details;
    } catch (error) {
      console.error(
        `❌ Failed to get details for token ${tokenId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get past NFTMinted events
   */
  async getPastMintEvents(
    fromBlock?: number
  ): Promise<ContractEvent[]> {
    try {
      console.log(
        "📜 Fetching past NFTMinted events..."
      );

      const currentBlock =
        await this.client.getBlockNumber();
      const startBlock = fromBlock
        ? BigInt(fromBlock)
        : currentBlock - BigInt(1000);

      const logs =
        await this.client.getLogs({
          address: this.contractAddress,
          event: {
            type: "event",
            name: "NFTMinted",
            inputs: [
              {
                type: "address",
                name: "to",
                indexed: true,
              },
              {
                type: "uint256",
                name: "tokenId",
                indexed: true,
              },
              {
                type: "uint8",
                name: "rarity",
                indexed: false,
              },
            ],
          },
          fromBlock: startBlock,
          toBlock: currentBlock,
        });

      const events: ContractEvent[] =
        logs.map((log) => ({
          tokenId: Number(
            log.args.tokenId
          ),
          to:
            log.args.to || zeroAddress,
          from: zeroAddress,
          transactionHash:
            log.transactionHash,
          blockNumber: Number(
            log.blockNumber
          ),
          rarity: Number(
            log.args.rarity
          ),
        }));

      console.log(
        `✅ Found ${events.length} past NFTMinted events`
      );
      return events;
    } catch (error) {
      console.error(
        "❌ Error fetching past NFTMinted events:",
        error
      );
      return [];
    }
  }
}
