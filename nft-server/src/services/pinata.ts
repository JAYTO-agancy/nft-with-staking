import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import {
  PinataUploadResponse,
  NFTMetadata,
} from "../types";

export class PinataService {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly jwt: string;
  private readonly baseUrl =
    "https://api.pinata.cloud";

  constructor() {
    this.apiKey =
      process.env.PINATA_API_KEY!;
    this.secretKey =
      process.env.PINATA_SECRET_KEY!;
    this.jwt = process.env.PINATA_JWT!;

    if (
      !this.apiKey ||
      !this.secretKey ||
      !this.jwt
    ) {
      throw new Error(
        "Pinata credentials not configured"
      );
    }
  }

  /**
   * Upload image to Pinata with public access
   */
  async uploadImage(
    imagePath: string,
    tokenId: number
  ): Promise<string> {
    try {
      console.log(
        `📤 Uploading image for token ${tokenId} to Pinata...`
      );

      const formData = new FormData();
      formData.append(
        "file",
        fs.createReadStream(imagePath)
      );

      // Metadata for the file
      const pinataMetadata =
        JSON.stringify({
          name: `${tokenId}.png`,
          keyvalues: {
            tokenId: tokenId.toString(),
            type: "image",
          },
        });
      formData.append(
        "pinataMetadata",
        pinataMetadata
      );

      // Options for public access
      const pinataOptions =
        JSON.stringify({
          cidVersion: 0,
          customPinPolicy: {
            regions: [
              {
                id: "FRA1",
                desiredReplicationCount: 1,
              },
              {
                id: "NYC1",
                desiredReplicationCount: 2,
              },
            ],
          },
        });
      formData.append(
        "pinataOptions",
        pinataOptions
      );

      const response =
        await axios.post<PinataUploadResponse>(
          `${this.baseUrl}/pinning/pinFileToIPFS`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${this.jwt}`,
            },
          }
        );

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log(
        `✅ Image uploaded successfully: ${ipfsUrl}`
      );

      return ipfsUrl;
    } catch (error) {
      console.error(
        "❌ Error uploading image to Pinata:",
        error
      );
      throw new Error(
        `Failed to upload image: ${error}`
      );
    }
  }

  /**
   * Upload metadata JSON to Pinata
   */
  async uploadMetadata(
    metadata: NFTMetadata,
    tokenId: number
  ): Promise<string> {
    try {
      console.log(
        `📤 Uploading metadata for token ${tokenId} to Pinata...`
      );

      const pinataMetadata = {
        name: `${tokenId}.json`,
        keyvalues: {
          tokenId: tokenId.toString(),
          type: "metadata",
          rarity:
            metadata.attributes.find(
              (attr) =>
                attr.trait_type ===
                "Rarity"
            )?.value || "Unknown",
        },
      };

      const pinataOptions = {
        cidVersion: 0,
        customPinPolicy: {
          regions: [
            {
              id: "FRA1",
              desiredReplicationCount: 1,
            },
            {
              id: "NYC1",
              desiredReplicationCount: 2,
            },
          ],
        },
      };

      const response =
        await axios.post<PinataUploadResponse>(
          `${this.baseUrl}/pinning/pinJSONToIPFS`,
          {
            pinataContent: metadata,
            pinataMetadata,
            pinataOptions,
          },
          {
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${this.jwt}`,
            },
          }
        );

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log(
        `✅ Metadata uploaded successfully: ${ipfsUrl}`
      );

      return ipfsUrl;
    } catch (error) {
      console.error(
        "❌ Error uploading metadata to Pinata:",
        error
      );
      throw new Error(
        `Failed to upload metadata: ${error}`
      );
    }
  }

  /**
   * Create a public group for NFT collection (call this once during setup)
   */
  async createPublicGroup(
    name: string
  ): Promise<string> {
    try {
      console.log(
        `📁 Creating public group: ${name}...`
      );

      const response = await axios.post(
        `${this.baseUrl}/groups`,
        {
          name,
          is_public: true,
        },
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${this.jwt}`,
          },
        }
      );

      console.log(
        `✅ Public group created: ${response.data.id}`
      );
      return response.data.id;
    } catch (error) {
      console.error(
        "❌ Error creating public group:",
        error
      );
      throw new Error(
        `Failed to create public group: ${error}`
      );
    }
  }

  /**
   * Test Pinata connection
   */
  async testAuthentication(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/data/testAuthentication`,
        {
          headers: {
            Authorization: `Bearer ${this.jwt}`,
          },
        }
      );

      console.log(
        "✅ Pinata authentication successful"
      );
      return (
        response.data.message ===
        "Congratulations! You are communicating with the Pinata API!"
      );
    } catch (error) {
      console.error(
        "❌ Pinata authentication failed:",
        error
      );
      return false;
    }
  }
}
