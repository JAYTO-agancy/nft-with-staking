// @ts-ignore
import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import path from 'path';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error('Pinata API keys are not set in environment variables');
}

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

export async function uploadFileToPinata(filePath: string): Promise<string> {
  try {
    const readableStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    const options = {
      pinataMetadata: {
        name: fileName,
      },
    };
    const result = await pinata.pinFileToIPFS(readableStream, options);
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}

export async function uploadFolderToPinata(folderPath: string): Promise<string> {
  try {
    const result = await pinata.pinFromFS(folderPath);
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata folder upload error:', error);
    throw error;
  }
}

export async function unpinFromPinata(cid: string): Promise<void> {
  try {
    await pinata.unpin(cid);
  } catch (error) {
    console.error('Pinata unpin error:', error);
    throw error;
  }
} 