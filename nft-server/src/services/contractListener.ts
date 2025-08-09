import {
  createPublicClient,
  http,
  webSocket,
  parseAbi,
  type PublicClient,
  type Address,
  zeroAddress,
} from "viem";
import { sepolia } from "viem/chains";
import { ContractEvent } from "../types";

// Минимальный слушатель использует только событие NFTMinted

export class ContractListenerService {
  private client: PublicClient;
  private contractAddress: Address;
  private isListening = false;
  private pollingInterval: NodeJS.Timeout | null =
    null;
  private lastProcessedBlock = 0;
  private wsClient: PublicClient | null =
    null;
  private wsUnwatch:
    | (() => void)
    | null = null;
  private wsUrl: string | undefined;
  private wsReconnectTimer: NodeJS.Timeout | null =
    null;
  private wsReconnectAttempts = 0;
  private readonly pollIntervalMs = 10000;

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

    // Инициализируем WS-клиент при наличии WS_RPC_URL
    this.wsUrl = process.env.WS_RPC_URL;

    if (this.wsUrl) {
      try {
        this.wsClient =
          createPublicClient({
            chain: sepolia,
            transport: webSocket(
              this.wsUrl,
              { retryCount: 0 }
            ),
          });
        console.log(
          "🔌 WS transport enabled"
        );
      } catch (e) {
        this.wsClient = null;
        console.warn(
          "⚠️ Failed to initialize WS transport, will use polling only",
          e
        );
      }
    }
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

    this.isListening = true;

    // Пытаемся подписаться через WS
    if (this.wsClient) {
      const ok =
        this.startWsSubscription(
          callback
        );
      if (ok) return;
      this.scheduleWsReconnect(
        callback
      );
    } else if (this.wsUrl) {
      this.scheduleWsReconnect(
        callback
      );
    }

    // Фоллбэк: polling
    this.startPolling(callback);
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

    if (this.wsUnwatch) {
      try {
        this.wsUnwatch();
      } catch {}
      this.wsUnwatch = null;
    }

    if (this.wsReconnectTimer) {
      clearTimeout(
        this.wsReconnectTimer
      );
      this.wsReconnectTimer = null;
    }

    this.isListening = false;
    console.log(
      "✅ Contract listener stopped"
    );
  }

  // Minimal server: no statistics initialization

  // Minimal server: no statistics updates

  // Minimal server: no statistics endpoint

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

  private startPolling(
    callback: (
      event: ContractEvent
    ) => void
  ) {
    if (this.pollingInterval) return;
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
      this.pollIntervalMs
    );
    console.log(
      "✅ Contract listener started (polling mode)"
    );
    console.log(
      `📝 Polling for NFTMinted events every ${
        this.pollIntervalMs / 1000
      }s`
    );
  }

  private stopPolling() {
    if (!this.pollingInterval) return;
    clearInterval(this.pollingInterval);
    this.pollingInterval = null;
    console.log("🛑 Polling stopped");
  }

  private startWsSubscription(
    callback: (
      event: ContractEvent
    ) => void
  ): boolean {
    if (!this.wsUrl) return false;
    try {
      if (!this.wsClient) {
        this.wsClient =
          createPublicClient({
            chain: sepolia,
            transport: webSocket(
              this.wsUrl,
              { retryCount: 0 }
            ),
          });
      }

      const abi = parseAbi([
        "event NFTMinted(address indexed to, uint256 indexed tokenId, uint8 rarity)",
      ]);

      this.wsUnwatch =
        this.wsClient.watchContractEvent(
          {
            address:
              this.contractAddress,
            abi,
            eventName: "NFTMinted",
            onLogs: (logs) => {
              for (const log of logs) {
                const event: ContractEvent =
                  {
                    tokenId: Number(
                      log.args?.tokenId
                    ),
                    to:
                      (log.args
                        ?.to as Address) ||
                      zeroAddress,
                    from: zeroAddress,
                    transactionHash:
                      log.transactionHash,
                    blockNumber: Number(
                      log.blockNumber ??
                        0
                    ),
                    rarity: Number(
                      log.args
                        ?.rarity ?? 0
                    ),
                  };
                console.log(
                  `🎉 [WS] NFTMinted: Token ${event.tokenId} to ${event.to} (Rarity: ${event.rarity})`
                );
                callback(event);
              }
            },
            onError: (err) => {
              console.error(
                "❌ WS subscription error:",
                err
              );
              this.handleWsDrop(
                callback
              );
            },
          }
        );

      console.log(
        "✅ WS subscription started for NFTMinted"
      );
      // Остановим polling, если восстановился WS
      this.stopPolling();
      // Сбросим счетчик реконнекта
      this.wsReconnectAttempts = 0;
      return true;
    } catch (e) {
      console.warn(
        "⚠️ Failed to start WS subscription",
        e
      );
      this.handleWsDrop(callback);
      return false;
    }
  }

  private handleWsDrop(
    callback: (
      event: ContractEvent
    ) => void
  ) {
    if (this.wsUnwatch) {
      try {
        this.wsUnwatch();
      } catch {}
      this.wsUnwatch = null;
    }
    this.wsClient = null;
    this.startPolling(callback);
    this.scheduleWsReconnect(callback);
  }

  private scheduleWsReconnect(
    callback: (
      event: ContractEvent
    ) => void
  ) {
    if (
      !this.isListening ||
      !this.wsUrl
    )
      return;
    if (this.wsReconnectTimer) return;

    const base = 1000;
    const max = 30000;
    const delay = Math.min(
      max,
      base *
        Math.pow(
          2,
          this.wsReconnectAttempts
        )
    );
    this.wsReconnectAttempts += 1;

    console.log(
      `🔁 Scheduling WS reconnect in ${Math.round(
        delay / 1000
      )}s`
    );
    this.wsReconnectTimer = setTimeout(
      () => {
        this.wsReconnectTimer = null;
        const ok =
          this.startWsSubscription(
            callback
          );
        if (!ok)
          this.scheduleWsReconnect(
            callback
          );
      },
      delay
    );
  }

  /**
   * Test contract connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log(
        "🔍 Testing contract connection..."
      );
      const block =
        await this.client.getBlockNumber();
      console.log(
        `✅ Connected. Current block: ${block}`
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
   * Fetch all NFTMinted events from genesis to current block
   */
  async getAllMintEvents(): Promise<
    ContractEvent[]
  > {
    try {
      const currentBlock =
        await this.client.getBlockNumber();
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
          fromBlock: BigInt(0),
          toBlock: currentBlock,
        });

      return logs.map((log) => ({
        tokenId: Number(
          log.args.tokenId
        ),
        to: log.args.to || zeroAddress,
        from: zeroAddress,
        transactionHash:
          log.transactionHash,
        blockNumber: Number(
          log.blockNumber
        ),
        rarity: Number(log.args.rarity),
      }));
    } catch (error) {
      console.error(
        "❌ Failed to fetch all NFTMinted events:",
        error
      );
      return [];
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<bigint> {
    return this.client.getBlockNumber();
  }

  /**
   * Fetch NFTMinted events between block range [fromBlock, toBlock]
   */
  async getMintEventsInRange(
    fromBlock: bigint,
    toBlock?: bigint
  ): Promise<ContractEvent[]> {
    try {
      const to =
        toBlock ??
        (await this.client.getBlockNumber());
      const maxRange = BigInt(
        Math.max(
          1,
          parseInt(
            process.env
              .MAX_LOG_RANGE_BLOCKS ||
              "9000",
            10
          )
        )
      );
      let cursor =
        fromBlock < 0n ? 0n : fromBlock;
      const end = to;
      const result: ContractEvent[] =
        [];

      while (cursor <= end) {
        const chunkEnd =
          cursor + maxRange - 1n <= end
            ? cursor + maxRange - 1n
            : end;
        const logs =
          await this.client.getLogs({
            address:
              this.contractAddress,
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
            fromBlock: cursor,
            toBlock: chunkEnd,
          });

        for (const log of logs) {
          result.push({
            tokenId: Number(
              log.args.tokenId
            ),
            to:
              log.args.to ||
              zeroAddress,
            from: zeroAddress,
            transactionHash:
              log.transactionHash,
            blockNumber: Number(
              log.blockNumber
            ),
            rarity: Number(
              log.args.rarity
            ),
          });
        }

        cursor = chunkEnd + 1n;
      }

      return result;
    } catch (error) {
      console.error(
        "❌ Failed to fetch NFTMinted events in range:",
        error
      );
      return [];
    }
  }

  /**
   * Read totalSupply() from ERC721Enumerable
   */
  async getTotalSupply(): Promise<number> {
    try {
      const abi = parseAbi([
        "function totalSupply() view returns (uint256)",
      ]);
      const totalSupply =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi,
            functionName: "totalSupply",
          }
        )) as bigint;
      return Number(totalSupply);
    } catch (error) {
      console.error(
        "❌ Failed to read totalSupply:",
        error
      );
      return 0;
    }
  }

  /**
   * Read rarity from public mapping tokenRarity(uint256) → uint8 (0..4)
   */
  async getTokenRarityByMapping(
    tokenId: number
  ): Promise<number | null> {
    try {
      const abi = parseAbi([
        "function tokenRarity(uint256 tokenId) view returns (uint8)",
      ]);
      const rarity =
        (await this.client.readContract(
          {
            address:
              this.contractAddress,
            abi,
            functionName: "tokenRarity",
            args: [BigInt(tokenId)],
          }
        )) as number;
      return rarity;
    } catch (error) {
      console.error(
        `❌ Failed to read tokenRarity for ${tokenId}:`,
        error
      );
      return null;
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
