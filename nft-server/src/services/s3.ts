import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import { NFTMetadata } from "../types";

export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly forcePathStyle: boolean;
  private readonly publicBaseUrl?: string;
  private readonly keyPrefix: string;

  constructor() {
    const accessKeyId =
      process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey =
      process.env.AWS_SECRET_ACCESS_KEY;
    this.region =
      process.env.AWS_REGION ||
      "us-east-1";
    this.bucket =
      process.env.S3_BUCKET || "";
    this.endpoint =
      process.env.S3_ENDPOINT ||
      undefined;
    this.publicBaseUrl =
      process.env.S3_PUBLIC_BASE_URL ||
      undefined;
    this.forcePathStyle =
      (
        process.env
          .S3_FORCE_PATH_STYLE ||
        "false"
      ).toLowerCase() === "true";
    this.keyPrefix =
      process.env.S3_PREFIX || "nft";

    if (!this.bucket) {
      throw new Error(
        "S3 bucket is not configured (S3_BUCKET)"
      );
    }

    if (
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new Error(
        "AWS credentials are not configured (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)"
      );
    }

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint: this.endpoint,
      forcePathStyle:
        this.forcePathStyle,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadBucketCommand({
          Bucket: this.bucket,
        })
      );
      console.log(
        "✅ S3 bucket access OK"
      );
      return true;
    } catch (error) {
      console.error(
        "❌ S3 bucket access failed:",
        error
      );
      return false;
    }
  }

  async uploadImage(
    imagePath: string,
    tokenId: number
  ): Promise<string> {
    try {
      console.log(
        `📤 Uploading image for token ${tokenId} to S3...`
      );

      const body = await fs.readFile(
        imagePath
      );
      const key = this.buildKey([
        "images",
        `${tokenId}.png`,
      ]);

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: "image/png",
        })
      );

      const url =
        this.buildPublicUrl(key);
      console.log(
        `✅ Image uploaded successfully: ${url}`
      );
      return url;
    } catch (error) {
      console.error(
        "❌ Error uploading image to S3:",
        error
      );
      throw new Error(
        `Failed to upload image: ${error}`
      );
    }
  }

  async uploadMetadata(
    metadata: NFTMetadata,
    tokenId: number
  ): Promise<string> {
    try {
      console.log(
        `📤 Uploading metadata for token ${tokenId} to S3...`
      );

      const body = Buffer.from(
        JSON.stringify(
          metadata,
          null,
          2
        )
      );
      const key = this.buildKey([
        "metadata",
        `${tokenId}.json`,
      ]);

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType:
            "application/json",
        })
      );

      const url =
        this.buildPublicUrl(key);
      console.log(
        `✅ Metadata uploaded successfully: ${url}`
      );
      return url;
    } catch (error) {
      console.error(
        "❌ Error uploading metadata to S3:",
        error
      );
      throw new Error(
        `Failed to upload metadata: ${error}`
      );
    }
  }

  private buildKey(
    parts: string[]
  ): string {
    return [this.keyPrefix, ...parts]
      .filter(Boolean)
      .join("/");
  }

  private buildPublicUrl(
    key: string
  ): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(
        /\/$/,
        ""
      )}/${key}`;
    }

    if (this.endpoint) {
      if (this.forcePathStyle) {
        return `${this.endpoint.replace(
          /\/$/,
          ""
        )}/${this.bucket}/${key}`;
      }
      const hostname = this.endpoint
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      const protocol =
        this.endpoint.startsWith(
          "http://"
        )
          ? "http"
          : "https";
      return `${protocol}://${this.bucket}.${hostname}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
