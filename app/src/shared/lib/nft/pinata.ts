import { PinataSDK } from "pinata";
import fs from "fs";
import path from "path";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY;

if (!PINATA_JWT) {
  throw new Error("PINATA_JWT is not set in environment variables");
}

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY || undefined,
});

export async function createPinataGroup(
  name: string,
): Promise<{ id: string; name: string; created_at: string }> {
  try {
    const group = await pinata.groups.public.create({ name });
    return {
      id: group.id,
      name: group.name,
      created_at: group.createdAt,
    };
  } catch (error) {
    console.error("Pinata group creation error:", error);
    throw error;
  }
}

export async function uploadFileToPinata(filePath: string): Promise<string> {
  try {
    const blob = new Blob([fs.readFileSync(filePath)]);
    const fileName = path.basename(filePath);
    const file = new File([blob], fileName, {
      type: "application/octet-stream",
    });
    const upload = await pinata.upload.public.file(file);
    return upload.cid;
  } catch (error) {
    console.error("Pinata upload error:", error);
    throw error;
  }
}

export async function uploadFileToPinataWithGroup(
  filePath: string,
  groupId: string,
): Promise<string> {
  try {
    const blob = new Blob([fs.readFileSync(filePath)]);
    const fileName = path.basename(filePath);
    const file = new File([blob], fileName, {
      type: "application/octet-stream",
    });
    const upload = await pinata.upload.public.file(file).group(groupId);
    return upload.cid;
  } catch (error) {
    console.error("Pinata upload (group) error:", error);
    throw error;
  }
}

export async function uploadFolderToPinata(
  folderPath: string,
): Promise<string> {
  try {
    // Читаем все файлы из папки и создаем массив File объектов
    const files: File[] = [];
    const fileNames = fs.readdirSync(folderPath);

    for (const fileName of fileNames) {
      const filePath = path.join(folderPath, fileName);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const blob = new Blob([fs.readFileSync(filePath)]);
        const file = new File([blob], fileName, {
          type: "application/octet-stream",
        });
        files.push(file);
      }
    }

    const upload = await pinata.upload.public.fileArray(files);
    return upload.cid;
  } catch (error) {
    console.error("Pinata folder upload error:", error);
    throw error;
  }
}

export async function unpinFromPinata(cid: string): Promise<void> {
  try {
    await pinata.files.public.delete([cid]);
  } catch (error) {
    console.error("Pinata unpin error:", error);
    throw error;
  }
}
